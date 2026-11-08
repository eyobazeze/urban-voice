"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, FolderOpen, Hourglass, MapPin, X } from "lucide-react";
import type { Report } from "@/lib/types";
import { CATEGORIES, categoryById, STATUS } from "@/lib/categories";
import { useMergedReports } from "@/lib/demo-store";
import { age, areaOf, isOpen, priorityOf, PRIORITY_LABEL } from "@/lib/analytics";
import GovMap from "./GovMapLoader";
import { STATUS_COLOR, type AreaSummary } from "@/lib/map-colors";
import { BarList } from "./charts";
import { Panel } from "./bits";
import { StatusBadge } from "../ui/StatusBadge";

const RED = "#dc3545", AMBER = "#e69a00", GREEN = "#2f9e44";

export function GovMapOps({ reports: serverReports, now }: { reports: Report[]; now: number }) {
  const all = useMergedReports(serverReports);
  const [mode, setMode] = useState<"areas" | "pins">("areas");
  const [selected, setSelected] = useState<string | null>(null);

  const open = useMemo(() => all.filter(isOpen), [all]);
  const areas = useMemo<AreaSummary[]>(() => {
    const groups = new Map<string, Report[]>();
    open.forEach((r) => groups.set(areaOf(r), [...(groups.get(areaOf(r)) ?? []), r]));
    return [...groups.entries()].map(([name, list]) => {
      const high = list.filter((r) => priorityOf(r, now) === "high").length;
      return {
        name, open: list.length, high,
        lat: list.reduce((a, r) => a + r.lat, 0) / list.length, lng: list.reduce((a, r) => a + r.lng, 0) / list.length,
        color: high >= 3 ? RED : high >= 1 ? AMBER : GREEN,
      };
    }).sort((a, b) => b.open - a.open);
  }, [open, now]);

  const critical = open.filter((r) => priorityOf(r, now) === "high").length;
  const recent = [...open].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4);
  const selArea = selected?.startsWith("area:") ? areas.find((a) => `area:${a.name}` === selected) : undefined;
  const selPin = selected?.startsWith("pin:") ? all.find((r) => `pin:${r.id}` === selected) : undefined;
  const tiles = [
    { label: "Open complaints", value: open.length, Icon: FolderOpen, ink: "#0b6fc2" },
    { label: "High priority", value: critical, Icon: AlertTriangle, ink: RED },
    { label: "In progress", value: all.filter((r) => r.status === "in_progress").length, Icon: Hourglass, ink: "#d97706" },
    { label: "Resolved", value: all.filter((r) => r.status === "resolved").length, Icon: CheckCircle2, ink: "#1b8500" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Map operations</h1>
          <p className="mt-1 text-muted">Where complaints are piling up, and which areas need a crew first.</p>
        </div>
        <div role="group" aria-label="Map view" className="grid grid-cols-2 rounded-full bg-slate-200/70 p-1">
          {([["areas", "Districts"], ["pins", "Every complaint"]] as const).map(([id, label]) => (
            <button key={id} aria-pressed={mode === id} onClick={() => { setMode(id); setSelected(null); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === id ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative isolate h-[60vh] min-h-[420px] overflow-hidden rounded-3xl border border-line xl:h-[calc(100dvh-13rem)]">
          <GovMap mode={mode} areas={areas} pins={open} selectedKey={selected} onSelect={setSelected} />

          {(selArea || selPin) && (
            <div role="dialog" aria-label="Selected" className="absolute bottom-4 left-4 right-4 z-[500] rounded-2xl border border-line bg-surface p-4 shadow-float sm:left-1/2 sm:right-auto sm:w-80 sm:-translate-x-1/2">
              <button onClick={() => setSelected(null)} aria-label="Close" className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full text-muted hover:bg-slate-100"><X size={16} aria-hidden /></button>
              {selArea && (
                <>
                  <h3 className="font-display text-lg font-bold">{selArea.name}</h3>
                  <dl className="mt-2 space-y-1.5 text-sm">
                    <div className="flex justify-between"><dt className="text-muted">Open complaints</dt><dd className="font-semibold">{selArea.open}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">High priority</dt><dd className="font-semibold" style={{ color: selArea.high ? RED : undefined }}>{selArea.high}</dd></div>
                  </dl>
                  <Link href={`/gov/complaints?area=${encodeURIComponent(selArea.name)}`} className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-deep">View complaints</Link>
                </>
              )}
              {selPin && (
                <>
                  <div className="flex items-center gap-2 pr-8 text-xs"><StatusBadge status={selPin.status} />
                    {priorityOf(selPin, now) && <span className="text-muted">{PRIORITY_LABEL[priorityOf(selPin, now)!]}</span>}</div>
                  <h3 className="mt-2 font-display text-base font-semibold leading-snug">{selPin.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin size={13} aria-hidden /> {selPin.address}</p>
                  <Link href={`/gov/complaints/${selPin.id}`} className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-deep">View details</Link>
                </>
              )}
            </div>
          )}

          <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-xl bg-surface/95 px-3 py-2 text-xs shadow-card">
            {mode === "areas" ? (
              <ul className="space-y-1">
                {[[RED, "3+ high priority"], [AMBER, "1–2 high priority"], [GREEN, "None high priority"]].map(([c, l]) => (
                  <li key={l} className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-full" style={{ background: c }} /> {l}</li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-1">
                {(["submitted", "in_review", "in_progress"] as const).map((s) => (
                  <li key={s} className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-full" style={{ background: STATUS_COLOR[s] }} /> {STATUS[s].label}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <Panel title="City overview">
            <dl className="grid grid-cols-2 gap-3">
              {tiles.map(({ label, value, Icon, ink }) => (
                <div key={label} className="rounded-2xl border border-line p-3.5">
                  <dt className="flex items-center gap-1.5 text-xs text-muted"><Icon size={14} aria-hidden style={{ color: ink }} /> {label}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title="Top problem areas" subtitle="Open complaints per district">
            <BarList items={areas.slice(0, 5).map((a) => ({ label: a.name, value: a.open, color: a.color, note: `${a.open} ${a.open === 1 ? "complaint" : "complaints"}` }))} />
            {areas.length === 0 && <p className="text-sm text-muted">No open complaints.</p>}
          </Panel>

          <Panel title="Recent complaints" action={<Link href="/gov/complaints" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-deep hover:underline">All <ArrowRight size={14} aria-hidden /></Link>}>
            <ul className="space-y-3">
              {recent.map((r) => {
                const cat = categoryById(r.category);
                const p = priorityOf(r, now);
                return (
                  <li key={r.id}>
                    <button onClick={() => { setMode("pins"); setSelected(`pin:${r.id}`); }} className="flex w-full items-center gap-3 text-left">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${cat.color} 13%, white)`, color: cat.color }}><cat.Icon size={18} aria-hidden /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{r.title}</span>
                        <span className="text-xs text-muted">{cat.label} · {age(r, now)} ago</span>
                      </span>
                      {p && <span className={`shrink-0 text-xs font-semibold ${p === "high" ? "text-rose-600" : p === "medium" ? "text-amber-600" : "text-emerald-600"}`}>{PRIORITY_LABEL[p]}</span>}
                    </button>
                  </li>
                );
              })}
              {recent.length === 0 && <li className="text-sm text-muted">Nothing open right now.</li>}
            </ul>
          </Panel>
        </div>
      </div>
      <p className="sr-only">{CATEGORIES.length} categories</p>
    </div>
  );
}
