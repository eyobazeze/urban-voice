"use client";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, FolderOpen, Hourglass } from "lucide-react";
import type { Report } from "@/lib/types";
import type { Staff } from "@/lib/gov-types";
import { CATEGORIES, categoryById } from "@/lib/categories";
import { useMergedReports } from "@/lib/demo-store";
import { age, areaOf, change, DAY, inLastDays, statusCounts, weeklySeries } from "@/lib/analytics";
import { StatusBadge } from "../ui/StatusBadge";
import { Donut, Legend, LineChart } from "./charts";
import { Kpi, Panel, shortDate } from "./bits";

const BLUE = "#0088e8";
const GREEN = "#1b8500";

export function GovDashboard({ reports: serverReports, staff, now }: { reports: Report[]; staff: Staff; now: number }) {
  const all = useMergedReports(serverReports);
  const d = useMemo(() => {
    const counts = statusCounts(all);
    const newThis = all.filter((r) => inLastDays(r.createdAt, 7, now)).length;
    const newPrev = all.filter((r) => inLastDays(r.createdAt, 7, now, 7)).length;
    const resolvedThis = all.filter((r) => inLastDays(r.resolvedAt, 7, now)).length;
    const resolvedPrev = all.filter((r) => inLastDays(r.resolvedAt, 7, now, 7)).length;
    const waiting = all.filter((r) => r.status === "submitted" || r.status === "in_review");
    const oldest = waiting.reduce<number>((m, r) => Math.max(m, (now - +new Date(r.createdAt)) / DAY), 0);
    const assigned = all.filter((r) => r.status === "in_progress" && r.assignee).length;
    const weeks = weeklySeries(all, now, 12);
    const byCategory = CATEGORIES.map((c) => ({ label: c.label, color: c.color, value: all.filter((r) => r.category === c.id).length }));
    const latest = [...waiting].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);
    return { counts, newThis, trend: change(newThis, newPrev), resolvedThis, resolvedTrend: change(resolvedThis, resolvedPrev), waiting: waiting.length, oldest, assigned, weeks, byCategory, latest };
  }, [all, now]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-deep">Hello, {staff.name.split(" ")[0]}</h1>
        <p className="mt-1 text-muted">Here is how complaints across the city are doing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total complaints" value={all.length} Icon={ClipboardList} tint="#e3f1fd" ink="#0b6fc2"
          note={`${d.newThis} new (${d.trend.text})`} noteTone={d.trend.good === null ? "muted" : "good"} />
        <Kpi label="Waiting for review" value={d.waiting} Icon={FolderOpen} tint="#fde8e8" ink="#d6336c"
          note={d.waiting ? `Oldest waiting ${Math.floor(d.oldest)} days` : "Nothing waiting"} noteTone={d.oldest >= 7 ? "bad" : "muted"} />
        <Kpi label="In progress" value={d.counts.in_progress} Icon={Hourglass} tint="#fdf0dc" ink="#d97706"
          note={`${d.assigned} assigned to staff`} />
        <Kpi label="Resolved" value={d.counts.resolved} Icon={CheckCircle2} tint="#e4f5e0" ink={GREEN}
          note={`${d.resolvedThis} this week (${d.resolvedTrend.text})`} noteTone={d.resolvedTrend.good === false ? "bad" : d.resolvedTrend.good ? "good" : "muted"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[3fr_2fr]">
        <Panel title="Complaint trend" subtitle="Received and resolved each week, last 12 weeks">
          <LineChart label="Complaints received and resolved per week" labels={d.weeks.map((w) => w.label)}
            series={[{ name: "Received", color: BLUE, values: d.weeks.map((w) => w.received) }, { name: "Resolved", color: GREEN, values: d.weeks.map((w) => w.resolved) }]} />
          <div className="mt-2"><Legend items={[{ name: "Received", color: BLUE }, { name: "Resolved", color: GREEN }]} /></div>
        </Panel>
        <Panel title="Complaints by category">
          <Donut centerLabel="Total" slices={d.byCategory} />
        </Panel>
      </div>

      <Panel title="New complaints" subtitle="Waiting for review or still being looked at"
        action={<Link href="/gov/complaints" className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep">View all <ArrowRight size={15} aria-hidden /></Link>}>
        {d.latest.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">No complaints are waiting. Nice work.</p>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>{["Issue", "Category", "District", "Submitted", "Status", "Assigned to", ""].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {d.latest.map((r) => {
                  const cat = categoryById(r.category);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="max-w-[260px] px-3 py-3.5"><Link href={`/gov/complaints/${r.id}`} className="line-clamp-2 font-medium hover:text-brand-deep hover:underline">{r.title}</Link></td>
                      <td className="px-3 py-3.5"><span className="inline-flex items-center gap-1.5 font-medium" style={{ color: cat.color }}><cat.Icon size={14} aria-hidden /> {cat.label}</span></td>
                      <td className="px-3 py-3.5 text-muted">{areaOf(r)}</td>
                      <td className="px-3 py-3.5 text-muted">{shortDate(r.createdAt)} <span className="text-xs">({age(r, now)})</span></td>
                      <td className="px-3 py-3.5"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-3.5 text-muted">{r.assignee ?? "Unassigned"}</td>
                      <td className="px-3 py-3.5 text-right"><Link href={`/gov/complaints/${r.id}`} className="font-semibold text-brand-deep hover:underline">Open</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 md:hidden">
            {d.latest.map((r) => {
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
          </>
        )}
      </Panel>
    </div>
  );
}
