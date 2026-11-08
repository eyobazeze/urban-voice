"use client";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, ClipboardList } from "lucide-react";
import type { Report, ReportStatus } from "@/lib/types";
import { categoryById, STATUS, STATUS_STEPS } from "@/lib/categories";
import { useMergedReports } from "@/lib/demo-store";
import { TimeAgo } from "./ui/TimeAgo";

const TONE: Record<ReportStatus, string> = {
  submitted: "#64748b", in_review: "#d97706", in_progress: "#0284c7", resolved: "#1b8500",
};

// Desktop right-hand panel when no report is open: a quick read on how your reports are doing.
export function ReportsOverview({ reports: serverReports }: { reports: Report[] }) {
  const all = useMergedReports(serverReports);
  const mine = useMemo(() => all.filter((r) => r.mine), [all]);
  const counts = STATUS_STEPS.map((s) => ({ s, n: mine.filter((r) => r.status === s).length }));
  const latest = [...mine].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h2 className="font-display text-2xl font-bold">Your reports at a glance</h2>
      <p className="mt-1 text-muted">Pick a report from the list to see its progress and discussion.</p>

      {mine.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-surface p-10 text-center">
          <ClipboardList size={36} aria-hidden className="mx-auto text-slate-300" />
          <p className="mt-3 font-medium">Nothing reported yet</p>
          <p className="mt-1 text-sm text-muted">When you report a problem it will show up here, so you can follow it from submitted to resolved.</p>
        </div>
      ) : (
        <>
          <dl className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {counts.map(({ s, n }) => (
              <div key={s} className="overflow-hidden rounded-2xl border border-line bg-surface p-4">
                <span aria-hidden className="mb-3 block h-1 w-8 rounded-full" style={{ background: TONE[s] }} />
                <dd className="font-display text-3xl font-bold">{n}</dd>
                <dt className="text-sm text-muted">{STATUS[s].label}</dt>
              </div>
            ))}
          </dl>

          <h3 className="mt-8 text-sm font-semibold">Latest</h3>
          <ul className="mt-3 space-y-2">
            {latest.map((r) => {
              const cat = categoryById(r.category);
              return (
                <li key={r.id}>
                  <Link href={`/reports/${r.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition-shadow hover:shadow-float">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${cat.color} 13%, white)`, color: cat.color }}>
                      <cat.Icon size={18} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.title}</span>
                      <span className="text-xs text-muted">{STATUS[r.status].label} · <TimeAgo iso={r.createdAt} /></span>
                    </span>
                    <ArrowRight size={17} aria-hidden className="shrink-0 text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
