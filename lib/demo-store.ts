"use client";
import { useMemo, useSyncExternalStore } from "react";
import type { Comment, HistoryEntry, Report, ReportStatus } from "./types";
import type { Settings } from "./profile-types";

// Demo mode only: reports a visitor files (and sample reports they delete) are kept in
// this browser so the whole flow can be tried before Supabase is connected.
function createStore<T>(key: string, empty: T) {
  const event = `${key}-changed`;
  let cacheRaw: string | null = null;
  let cacheValue: T = empty;

  const getSnapshot = (): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === cacheRaw) return cacheValue;
      cacheRaw = raw;
      cacheValue = raw ? (JSON.parse(raw) as T) : empty;
      return cacheValue;
    } catch {
      return empty;
    }
  };
  const subscribe = (onChange: () => void) => {
    window.addEventListener("storage", onChange);
    window.addEventListener(event, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(event, onChange);
    };
  };
  const set = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value)); // throws if storage is full; the caller handles it
    window.dispatchEvent(new Event(event));
  };
  const reset = () => {
    localStorage.removeItem(key);
    window.dispatchEvent(new Event(event));
  };
  const use = () => useSyncExternalStore(subscribe, getSnapshot, () => empty);
  return { getSnapshot, set, reset, use };
}

const reportsStore = createStore<Report[]>("uv-demo-reports", []);
const hiddenStore = createStore<string[]>("uv-demo-hidden", []);

const likesStore = createStore<string[]>("uv-demo-likes", []);
const NO_COMMENTS: Record<string, Comment[]> = {};
const EMPTY_LIST: Comment[] = [];
const commentsStore = createStore<Record<string, Comment[]>>("uv-demo-comments", NO_COMMENTS);

export const useDemoLikes = () => likesStore.use();
export function toggleDemoLike(id: string) {
  const cur = likesStore.getSnapshot();
  likesStore.set(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
}

/** Comments the visitor wrote on one report (demo mode). */
export function useDemoComments(reportId: string): Comment[] {
  return commentsStore.use()[reportId] ?? EMPTY_LIST;
}
export function addDemoComment(reportId: string, comment: Comment) {
  const all = commentsStore.getSnapshot();
  commentsStore.set({ ...all, [reportId]: [...(all[reportId] ?? []), comment] });
}
export function deleteDemoComment(reportId: string, commentId: string) {
  const all = commentsStore.getSnapshot();
  commentsStore.set({ ...all, [reportId]: (all[reportId] ?? []).filter((c) => c.id !== commentId) });
}

export interface DemoStatusEntry {
  status?: ReportStatus;
  assigneeId?: string | null;
  assignee?: string | null;
  resolvedAt?: string | null;
  history: HistoryEntry[];
}
const NO_STATUS: Record<string, DemoStatusEntry> = {};
const statusStore = createStore<Record<string, DemoStatusEntry>>("uv-demo-status", NO_STATUS);

export const useDemoStatus = () => statusStore.use();

/** A report as the staff portal last left it (demo mode). */
export function applyDemoStatus(r: Report, o?: DemoStatusEntry): Report {
  if (!o) return r;
  return {
    ...r,
    status: o.status ?? r.status,
    assigneeId: o.assigneeId === undefined ? r.assigneeId : (o.assigneeId ?? undefined),
    assignee: o.assignee === undefined ? r.assignee : (o.assignee ?? undefined),
    resolvedAt: o.resolvedAt === undefined ? r.resolvedAt : (o.resolvedAt ?? undefined),
  };
}

export function demoSetStatus(report: Report, status: ReportStatus, note: string, staffName: string) {
  const all = statusStore.getSnapshot();
  const cur = all[report.id] ?? { history: [] };
  const now = new Date().toISOString();
  const entry: HistoryEntry = { id: `demo-h-${Date.now().toString(36)}`, status, note: note.trim() || undefined, by: staffName, createdAt: now };
  statusStore.set({
    ...all,
    [report.id]: { ...cur, status, resolvedAt: status === "resolved" ? now : null, history: [...cur.history, entry] },
  });
}

export function demoAssign(report: Report, staff: { id: string; name: string } | null) {
  const all = statusStore.getSnapshot();
  const cur = all[report.id] ?? { history: [] };
  statusStore.set({ ...all, [report.id]: { ...cur, assigneeId: staff?.id ?? null, assignee: staff?.name ?? null } });
}

export interface DemoProfile { name?: string; handle?: string; settings?: Settings }
const EMPTY_PROFILE: DemoProfile = {};
const profileStore = createStore<DemoProfile>("uv-demo-profile", EMPTY_PROFILE);

export const useDemoProfile = () => profileStore.use();
export function updateDemoProfile(patch: DemoProfile) {
  profileStore.set({ ...profileStore.getSnapshot(), ...patch });
}
/** Clears everything the demo keeps in this browser. */
export function resetDemoData() {
  reportsStore.reset();
  hiddenStore.reset();
  profileStore.reset();
  likesStore.reset();
  commentsStore.reset();
  statusStore.reset();
}

export const useDemoReports = () => reportsStore.use();
export const useHiddenIds = () => hiddenStore.use();

export function addDemoReport(report: Report) {
  reportsStore.set([report, ...reportsStore.getSnapshot()]);
}

/** Deletes a report the visitor filed, or hides one of the built-in sample reports. */
export function deleteDemoReport(id: string) {
  if (id.startsWith("demo-")) reportsStore.set(reportsStore.getSnapshot().filter((r) => r.id !== id));
  else hiddenStore.set([...new Set([...hiddenStore.getSnapshot(), id])]);
}

/** Server reports plus this browser's demo reports, minus anything deleted. */
export function useMergedReports(server: Report[]): Report[] {
  const demo = reportsStore.use();
  const hidden = hiddenStore.use();
  const profile = profileStore.use();
  const overlay = statusStore.use();
  return useMemo(
    () =>
      [...demo, ...server]
        .filter((r) => !hidden.includes(r.id))
        .map((r) => applyDemoStatus(r, overlay[r.id]))
        // A renamed demo profile shows on the reports it owns
        .map((r) => (r.mine && (profile.name || profile.handle)
          ? { ...r, author: { ...r.author, name: profile.name || r.author.name, handle: profile.handle || r.author.handle } }
          : r)),
    [demo, server, hidden, profile, overlay],
  );
}

/** True once the page is running in the browser (false while rendering on the server). */
export function useHydrated(): boolean {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}
