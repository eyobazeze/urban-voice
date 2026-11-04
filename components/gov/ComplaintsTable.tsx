"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { CategoryId, Report, ReportStatus } from "@/lib/types";
import { CATEGORIES, categoryById, STATUS } from "@/lib/categories";
import { useMergedReports } from "@/lib/demo-store";
import { age, areaOf, priorityOf, type Priority } from "@/lib/analytics";
import { StatusBadge } from "../ui/StatusBadge";
import { Panel, PriorityPill, shortDate } from "./bits";

type Sort = "newest" | "oldest" | "supported" | "priority";
const PAGE = 12;
const RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const select = "h-11 rounded-full border border-line bg-surface px-4 text-sm focus:border-brand focus:outline-none";

export function ComplaintsTable({ reports: serverReports, now, initialArea = "all", initialStatus = "all" }: {
  reports: Report[]; now: number; initialArea?: string; initialStatus?: string;
}) {
  const all = useMergedReports(serverReports);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReportStatus | "all">((["submitted", "in_review", "in_progress", "resolved"].includes(initialStatus) ? initialStatus : "all") as ReportStatus | "all");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [area, setArea] = useState(initialArea);
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);

  const areas = useMemo(() => [...new Set(all.map(areaOf))].sort(), [all]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((r) => (status === "all" || r.status === status) && (category === "all" || r.category === category) && (area === "all" || areaOf(r) === area))
      .filter((r) => !q || `${r.title} ${r.address} ${r.id} ${r.assignee ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === "oldest") return +new Date(a.createdAt) - +new Date(b.createdAt);
        if (sort === "supported") return b.likes - a.likes;
        if (sort === "priority") {
          const pa = priorityOf(a, now), pb = priorityOf(b, now);
          return (pa ? RANK[pa] : 9) - (pb ? RANK[pb] : 9) || b.likes - a.likes;
        }
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      });
  }, [all, query, status, category, area, sort, now]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * PAGE, current * PAGE);
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold">Complaints</h1>
        <p className="mt-1 text-muted">Review, assign and resolve what citizens have reported.</p>
      </div>

      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block min-w-[220px] flex-1">
            <span className="sr-only">Search complaints</span>
            <Search size={17} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand" />
            <input value={query} onChange={(e) => reset(setQuery)(e.target.value)} placeholder="Search by title, place, ID or officer"
              className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-sm placeholder:text-muted focus:border-brand focus:outline-none" />
          </label>
          <label><span className="sr-only">Status</span>
            <select className={select} value={status} onChange={(e) => reset(setStatus)(e.target.value as ReportStatus | "all")}>
              <option value="all">All statuses</option>
              {(Object.keys(STATUS) as ReportStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
            </select></label>
          <label><span className="sr-only">Category</span>
            <select className={select} value={category} onChange={(e) => reset(setCategory)(e.target.value as CategoryId | "all")}>
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select></label>
          <label><span className="sr-only">District</span>
            <select className={select} value={area} onChange={(e) => reset(setArea)(e.target.value)}>
              <option value="all">All districts</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select></label>
          <label><span className="sr-only">Sort by</span>
            <select className={select} value={sort} onChange={(e) => reset(setSort)(e.target.value as Sort)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Highest priority</option>
              <option value="supported">Most supported</option>
            </select></label>
        </div>

        {rows.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">No complaints match these filters.</p>
        ) : (
          <>
            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted">
                  <tr>{["Issue", "Category", "District", "Submitted", "Priority", "Status", "Assigned to", ""].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map((r) => {
                    const cat = categoryById(r.category);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="max-w-[280px] px-3 py-3.5">
                          <Link href={`/gov/complaints/${r.id}`} className="line-clamp-2 font-medium hover:text-brand-deep hover:underline">{r.title}</Link>
                          <span className="text-xs text-muted">{r.likes} supporters</span>
                        </td>
                        <td className="px-3 py-3.5"><span className="inline-flex items-center gap-1.5 font-medium" style={{ color: cat.color }}><cat.Icon size={14} aria-hidden /> {cat.label}</span></td>
                        <td className="px-3 py-3.5 text-muted">{areaOf(r)}</td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-muted">{shortDate(r.createdAt)} <span className="text-xs">({age(r, now)})</span></td>
                        <td className="px-3 py-3.5"><PriorityPill priority={priorityOf(r, now)} /></td>
                        <td className="px-3 py-3.5"><StatusBadge status={r.status} /></td>
                        <td className="px-3 py-3.5 text-muted">{r.assignee ?? "Unassigned"}</td>
                        <td className="px-3 py-3.5 text-right"><Link href={`/gov/complaints/${r.id}`} className="font-semibold text-brand-deep hover:underline">Open</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="mt-5 space-y-3 md:hidden">
              {shown.map((r) => {
                const cat = categoryById(r.category);
                return (
                  <li key={r.id}>
                    <Link href={`/gov/complaints/${r.id}`} className="block rounded-2xl border border-line p-4">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: cat.color }}><cat.Icon size={13} aria-hidden /> {cat.label}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="mt-2 font-medium leading-snug">{r.title}</p>
                      <p className="mt-1 text-xs text-muted">{areaOf(r)} · {shortDate(r.createdAt)} ({age(r, now)}) · {r.assignee ?? "Unassigned"}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted">
              <p>Showing {(current - 1) * PAGE + 1}–{Math.min(current * PAGE, rows.length)} of {rows.length}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(current - 1)} disabled={current <= 1} aria-label="Previous page" className="grid size-9 place-items-center rounded-full border border-line disabled:opacity-40"><ChevronLeft size={16} aria-hidden /></button>
                <span>Page {current} of {pages}</span>
                <button onClick={() => setPage(current + 1)} disabled={current >= pages} aria-label="Next page" className="grid size-9 place-items-center rounded-full border border-line disabled:opacity-40"><ChevronRight size={16} aria-hidden /></button>
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
