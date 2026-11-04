import type { Report, ReportStatus } from "./types";

export const DAY = 86_400_000;

/** The district a report belongs to: the last part of its address ("Bole Road, Bole" -> "Bole"). */
export function areaOf(r: Report): string {
  if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(r.address.trim())) return "Unnamed area"; // an address that is just coordinates
  const parts = r.address.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : (parts[0] ?? "Unknown area");
}

export const isOpen = (r: Report) => r.status !== "resolved";

export type Priority = "high" | "medium" | "low";

/** Open reports are ranked by how many neighbours back them and how long they have waited. */
export function priorityOf(r: Report, now: number): Priority | null {
  if (!isOpen(r)) return null;
  const waitingDays = (now - +new Date(r.createdAt)) / DAY;
  if (r.likes >= 100 || waitingDays >= 7) return "high";
  if (r.likes >= 40 || waitingDays >= 3) return "medium";
  return "low";
}
export const PRIORITY_LABEL: Record<Priority, string> = { high: "High priority", medium: "Medium", low: "Low" };
export const PRIORITY_TONE: Record<Priority, string> = {
  high: "bg-rose-50 text-rose-700", medium: "bg-amber-50 text-amber-700", low: "bg-emerald-50 text-emerald-700",
};

export function daysToResolve(r: Report): number | null {
  return r.resolvedAt ? Math.max(0, (+new Date(r.resolvedAt) - +new Date(r.createdAt)) / DAY) : null;
}

export const average = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);

export function formatDays(days: number | null): string {
  if (days === null) return "n/a";
  if (days < 1) return `${Math.max(1, Math.round(days * 24))}h`;
  return `${days.toFixed(1)}d`;
}

export function age(r: Report, now: number): string {
  const days = (now - +new Date(r.createdAt)) / DAY;
  if (days < 1) return `${Math.max(1, Math.round(days * 24))}h`;
  return `${Math.floor(days)}d`;
}

export function countBy<T extends string>(reports: Report[], key: (r: Report) => T): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of reports) out[key(r)] = (out[key(r)] ?? 0) + 1;
  return out;
}

export function statusCounts(reports: Report[]): Record<ReportStatus, number> {
  const out: Record<ReportStatus, number> = { submitted: 0, in_review: 0, in_progress: 0, resolved: 0 };
  for (const r of reports) out[r.status]++;
  return out;
}

export interface WeekPoint { label: string; received: number; resolved: number }

/** Reports received and resolved in each of the last `weeks` weeks (oldest first). */
export function weeklySeries(reports: Report[], now: number, weeks = 12): WeekPoint[] {
  const out: WeekPoint[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const end = now - w * 7 * DAY;
    const start = end - 7 * DAY;
    out.push({
      label: new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      received: reports.filter((r) => +new Date(r.createdAt) > start && +new Date(r.createdAt) <= end).length,
      resolved: reports.filter((r) => r.resolvedAt && +new Date(r.resolvedAt) > start && +new Date(r.resolvedAt) <= end).length,
    });
  }
  return out;
}

export function inLastDays(iso: string | undefined, days: number, now: number, offsetDays = 0): boolean {
  if (!iso) return false;
  const t = +new Date(iso);
  return t <= now - offsetDays * DAY && t > now - (offsetDays + days) * DAY;
}

/** "+12%" or "-8%" against a previous value, or a plain note when there is no baseline. */
export function change(current: number, previous: number): { text: string; good: boolean | null } {
  if (previous === 0) return current === 0 ? { text: "No change", good: null } : { text: `+${current} new`, good: null };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { text: `${pct >= 0 ? "+" : ""}${pct}%`, good: pct === 0 ? null : pct > 0 };
}
