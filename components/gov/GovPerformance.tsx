"use client";
import { useMemo } from "react";
import { CheckCircle2, Clock, Gauge, Inbox } from "lucide-react";
import type { Report } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { useMergedReports } from "@/lib/demo-store";
import { areaOf, average, daysToResolve, formatDays, inLastDays, isOpen, weeklySeries } from "@/lib/analytics";
import { BarList, GroupedBars, Legend } from "./charts";
import { Kpi, Panel } from "./bits";

const BLUE = "#0088e8", GREEN = "#1b8500";

export function GovPerformance({ reports: serverReports, now }: { reports: Report[]; now: number }) {
  const all = useMergedReports(serverReports);
  const d = useMemo(() => {
    const resolved = all.filter((r) => r.status === "resolved");
    const times = resolved.map(daysToResolve).filter((x): x is number => x !== null);
    const recentTimes = resolved.filter((r) => inLastDays(r.resolvedAt, 30, now)).map(daysToResolve).filter((x): x is number => x !== null);
    const weeks = weeklySeries(all, now, 12);
    const byCategory = CATEGORIES.map((c) => {
      const t = resolved.filter((r) => r.category === c.id).map(daysToResolve).filter((x): x is number => x !== null);
      return { label: c.label, color: c.color, value: average(t) ?? 0, n: t.length };
    }).filter((c) => c.n > 0).sort((a, b) => b.value - a.value);
    const speed = [
      { label: "Within 2 days", value: times.filter((t) => t <= 2).length, color: "#2f9e44" },
      { label: "3 to 7 days", value: times.filter((t) => t > 2 && t <= 7).length, color: "#e69a00" },
      { label: "More than a week", value: times.filter((t) => t > 7).length, color: "#dc3545" },
    ];
    const team = new Map<string, { open: number; done: number; times: number[] }>();
    all.filter((r) => r.assignee).forEach((r) => {
      const t = team.get(r.assignee!) ?? { open: 0, done: 0, times: [] };
      if (isOpen(r)) t.open++; else { t.done++; const x = daysToResolve(r); if (x !== null) t.times.push(x); }
      team.set(r.assignee!, t);
    });
    const areas = Object.entries(all.reduce<Record<string, number>>((m, r) => ((m[areaOf(r)] = (m[areaOf(r)] ?? 0) + 1), m), {}))
      .sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      avgAll: average(times), avg30: average(recentTimes),
      rate: all.length ? Math.round((resolved.length / all.length) * 100) : 0,
      resolved30: resolved.filter((r) => inLastDays(r.resolvedAt, 30, now)).length,
      backlog: all.filter(isOpen).length, weeks, byCategory, speed,
      team: [...team.entries()].map(([name, v]) => ({ name, ...v, avg: average(v.times) })).sort((a, b) => b.done - a.done),
      areas, resolvedCount: times.length,
    };
  }, [all, now]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold">Performance</h1>
        <p className="mt-1 text-muted">How quickly the city is resolving what residents report.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Average time to resolve" value={formatDays(d.avgAll)} Icon={Clock} tint="#e3f1fd" ink="#0b6fc2"
          note={d.avg30 !== null ? `${formatDays(d.avg30)} in last 30 days` : "None resolved lately"} />
        <Kpi label="Resolution rate" value={`${d.rate}%`} Icon={Gauge} tint="#e4f5e0" ink={GREEN} note="Of all received" />
        <Kpi label="Resolved, last 30 days" value={d.resolved30} Icon={CheckCircle2} tint="#e4f5e0" ink={GREEN} note="Closed by the team" />
        <Kpi label="Backlog" value={d.backlog} Icon={Inbox} tint="#fdf0dc" ink="#d97706" note="Complaints still open" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Received and resolved" subtitle="Per week, last 12 weeks">
          <GroupedBars labels={d.weeks.map((w) => w.label)} a={d.weeks.map((w) => w.received)} b={d.weeks.map((w) => w.resolved)}
            aName="Received" bName="Resolved" aColor={BLUE} bColor={GREEN} />
          <div className="mt-3"><Legend items={[{ name: "Received", color: BLUE }, { name: "Resolved", color: GREEN }]} /></div>
        </Panel>
        <Panel title="How fast complaints are closed" subtitle={`Across ${d.resolvedCount} resolved complaints`}>
          <BarList items={d.speed.map((s) => ({ ...s, note: `${s.value} (${d.resolvedCount ? Math.round((s.value / d.resolvedCount) * 100) : 0}%)` }))} max={Math.max(1, d.resolvedCount)} />
        </Panel>
        <Panel title="Average days to resolve, by category">
          {d.byCategory.length ? <BarList unit=" days" items={d.byCategory.map((c) => ({ label: c.label, value: Math.round(c.value * 10) / 10, color: c.color }))} /> : <p className="text-sm text-muted">Nothing resolved yet.</p>}
        </Panel>
        <Panel title="Busiest districts" subtitle="All complaints received">
          <BarList items={d.areas.map(([label, value]) => ({ label, value, note: `${value} ${value === 1 ? "complaint" : "complaints"}` }))} />
        </Panel>
      </div>

      <Panel title="Team workload" subtitle="Complaints by the officer they are assigned to">
        {d.team.length === 0 ? <p className="text-sm text-muted">No complaints have been assigned yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>{["Officer", "Open", "Resolved", "Avg. time to resolve"].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {d.team.map((t) => (
                  <tr key={t.name}><td className="px-3 py-3 font-medium">{t.name}</td><td className="px-3 py-3">{t.open}</td><td className="px-3 py-3">{t.done}</td><td className="px-3 py-3 text-muted">{formatDays(t.avg)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
