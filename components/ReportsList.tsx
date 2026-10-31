"use client";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Report, ReportStatus } from "@/lib/types";
import { STATUS } from "@/lib/categories";
import { ReportListItem } from "./ReportListItem";
import { useMergedReports } from "@/lib/demo-store";

type Sort = "newest" | "liked";
type Tab = "mine" | "community";
const STATUS_FILTERS: (ReportStatus | "all")[] = ["all", "submitted", "in_review", "in_progress", "resolved"];

const COPY: Record<Tab, { hint: string; empty: string }> = {
  mine: {
    hint: "Follow each of your reports as the city works on it.",
    empty: "You haven't reported anything yet. Use Add report in the menu to file your first one.",
  },
  community: {
    hint: "See what other people are reporting and how it is going.",
    empty: "No reports match your filters.",
  },
};

export function ReportsList({ reports: serverReports, activeId }: { reports: Report[]; activeId: string | null }) {
  const reports = useMergedReports(serverReports);
  const activeReport = reports.find((r) => r.id === activeId);
  const [tab, setTab] = useState<Tab>(activeReport && !activeReport.mine ? "community" : "mine");
  const [prevActive, setPrevActive] = useState(activeId);
  // Opening a report (for example from a map pin) switches to the tab it belongs to
  if (activeId !== prevActive) {
    setPrevActive(activeId);
    if (activeReport) setTab(activeReport.mine ? "mine" : "community");
  }

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReportStatus | "all">("all");
  const [sort, setSort] = useState<Sort>("newest");

  const counts = useMemo(() => ({
    mine: reports.filter((r) => r.mine).length,
    community: reports.filter((r) => !r.mine).length,
  }), [reports]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter((r) => (tab === "mine" ? r.mine : !r.mine))
      .filter((r) => (status === "all" || r.status === status) && (!q || `${r.title} ${r.address} ${r.body}`.toLowerCase().includes(q)))
      .sort((a, b) => sort === "liked" ? b.likes - a.likes : +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [reports, tab, query, status, sort]);

  // Bring the selected report into view (e.g. arriving from a map pin)
  useEffect(() => {
    if (!activeId) return;
    document.querySelector(`[data-report-id="${activeId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeId, tab]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "mine", label: "My reports" },
    { id: "community", label: "Community" },
  ];

  return (
    <div className="flex flex-col lg:h-full">
      <div className="shrink-0 space-y-3 p-4 pb-2">
        <h1 className="font-display text-2xl font-bold">Reports</h1>

        <div role="tablist" aria-label="Whose reports" className="grid grid-cols-2 rounded-full bg-slate-200/70 p-1">
          {tabs.map(({ id, label }) => (
            <button
              key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === id ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
              }`}
            >
              {label} <span className="ml-1 font-medium text-muted">{counts[id]}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">{COPY[tab].hint}</p>

        <div className="flex items-center gap-2">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">Search reports</span>
            <Search size={17} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reports"
              className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-[15px] placeholder:text-muted focus:border-brand focus:outline-none"
            />
          </label>
          <label className="shrink-0">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 rounded-full border border-line bg-surface px-3 text-sm">
              <option value="newest">Newest</option>
              <option value="liked">Most liked</option>
            </select>
          </label>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s} aria-pressed={status === s} onClick={() => setStatus(s)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                status === s ? "border-brand bg-brand text-white" : "border-line bg-surface hover:bg-slate-50"
              }`}
            >
              {s === "all" ? "All" : STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-3 p-4 pt-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto" aria-label={tab === "mine" ? "My reports" : "Community reports"}>
        {visible.length === 0 && (
          <li className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
            {query || status !== "all" ? "No reports match your filters." : COPY[tab].empty}
          </li>
        )}
        {visible.map((r) => (
          <li key={r.id}><ReportListItem report={r} active={r.id === activeId} showProgress={tab === "mine"} /></li>
        ))}
      </ul>
    </div>
  );
}
