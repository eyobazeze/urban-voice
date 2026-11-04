import type { CategoryId, Comment, HistoryEntry, Report, ReportStatus } from "./types";
import { getMockComments, getMockReports } from "./mock-data";
import { isSupabaseConfigured } from "./supabase/client";
import { createClient } from "./supabase/server";

// Single seam for data access. With Supabase configured these read the real database;
// without it they return the built-in sample data.

interface FeedRow {
  id: string; title: string; body: string; category: CategoryId; status: ReportStatus;
  lat: number; lng: number; address: string; photo_urls: string[] | null;
  author_id: string; author_name: string | null; author_handle: string | null; author_avatar: string | null;
  created_at: string; like_count: number | string; comment_count: number | string;
  assigned_to: string | null; resolved_at: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toReport(r: FeedRow, userId?: string, likedIds?: Set<string>, names?: Map<string, string>): Report {
  return {
    id: r.id, title: r.title, body: r.body, category: r.category, status: r.status,
    lat: r.lat, lng: r.lng, address: r.address,
    photoUrls: r.photo_urls?.length ? r.photo_urls : undefined,
    author: { name: r.author_name || r.author_handle || "A neighbour", handle: r.author_handle ?? "", avatarUrl: r.author_avatar ?? undefined },
    createdAt: r.created_at,
    mine: Boolean(userId) && r.author_id === userId,
    likedByMe: likedIds?.has(r.id) ?? false,
    resolvedAt: r.resolved_at ?? undefined,
    assigneeId: r.assigned_to ?? undefined,
    assignee: r.assigned_to ? names?.get(r.assigned_to) : undefined,
    likes: Number(r.like_count), comments: Number(r.comment_count), shares: 0,
  };
}

type Db = Awaited<ReturnType<typeof createClient>>;

/** Names of the staff members who are assigned to reports. */
async function staffNames(supabase: Db, ids: (string | null)[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (!unique.length) return new Map();
  const { data } = await supabase.from("profiles").select("id, full_name, handle").in("id", unique);
  return new Map((data ?? []).map((p: { id: string; full_name: string | null; handle: string | null }) => [p.id, p.full_name || p.handle || "Staff"]));
}

export async function getReports(): Promise<Report[]> {
  if (!isSupabaseConfigured()) return getMockReports();
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const [feed, likes] = await Promise.all([
    supabase.from("report_feed").select("*").order("created_at", { ascending: false }).limit(200),
    auth.user ? supabase.from("likes").select("report_id").eq("user_id", auth.user.id) : Promise.resolve({ data: [] as { report_id: string }[] }),
  ]);
  if (feed.error) throw new Error("Couldn't load reports");
  const likedIds = new Set((likes.data ?? []).map((l) => l.report_id));
  const rows = feed.data as FeedRow[];
  const names = await staffNames(supabase, rows.map((r) => r.assigned_to));
  return rows.map((r) => toReport(r, auth.user?.id, likedIds, names));
}

export async function getReport(id: string): Promise<Report | null> {
  if (!isSupabaseConfigured()) return getMockReports().find((r) => r.id === id) ?? null;
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const [feed, like] = await Promise.all([
    supabase.from("report_feed").select("*").eq("id", id).maybeSingle(),
    auth.user
      ? supabase.from("likes").select("report_id").eq("report_id", id).eq("user_id", auth.user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (feed.error) throw new Error("Couldn't load this report");
  if (!feed.data) return null;
  const row = feed.data as FeedRow;
  const names = await staffNames(supabase, [row.assigned_to]);
  return toReport(row, auth.user?.id, new Set(like.data ? [id] : []), names);
}

interface CommentRow {
  id: string; body: string; created_at: string; author_id: string;
  profiles: { full_name: string | null; handle: string | null; avatar_url: string | null }
    | { full_name: string | null; handle: string | null; avatar_url: string | null }[] | null;
}

export async function getComments(reportId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured()) return getMockComments(reportId);
  if (!UUID.test(reportId)) return [];
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("comments")
    .select("id, body, created_at, author_id, profiles(full_name, handle, avatar_url)")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });
  if (error) throw new Error("Couldn't load comments");
  return (data as unknown as CommentRow[]).map((c) => {
    const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    return {
      id: c.id, body: c.body, createdAt: c.created_at, mine: Boolean(auth.user) && c.author_id === auth.user?.id,
      author: { name: p?.full_name || p?.handle || "A neighbour", handle: p?.handle ?? "", avatarUrl: p?.avatar_url ?? undefined },
    };
  });
}

interface HistoryRow {
  id: number; to_status: ReportStatus; note: string | null; created_at: string;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
}

/** The status changes staff have made to a report, oldest first. */
export async function getHistory(reportId: string): Promise<HistoryEntry[]> {
  if (!isSupabaseConfigured() || !UUID.test(reportId)) return []; // demo-mode history lives in the browser
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("status_history")
    .select("id, to_status, note, created_at, profiles(full_name)")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });
  if (error) throw new Error("Couldn't load the updates");
  return (data as unknown as HistoryRow[]).map((h) => {
    const p = Array.isArray(h.profiles) ? h.profiles[0] : h.profiles;
    return { id: String(h.id), status: h.to_status, note: h.note ?? undefined, by: p?.full_name ?? undefined, createdAt: h.created_at };
  });
}
