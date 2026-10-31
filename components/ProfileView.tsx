"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import type { Report } from "@/lib/types";
import type { Profile } from "@/lib/profile-types";
import { useDemoProfile, useMergedReports } from "@/lib/demo-store";
import { compact } from "@/lib/format";
import { Avatar } from "./ui/Avatar";
import { ReportListItem } from "./ReportListItem";

type Tab = "active" | "resolved";

export function ProfileView({ profile, reports: serverReports }: { profile: Profile; reports: Report[] }) {
  const demoProfile = useDemoProfile();
  const name = (profile.demo && demoProfile.name) || profile.name || "Your name";
  const handle = (profile.demo && demoProfile.handle) || profile.handle;

  const all = useMergedReports(serverReports);
  const mine = useMemo(() => all.filter((r) => r.mine), [all]);
  const active = mine.filter((r) => r.status !== "resolved");
  const resolved = mine.filter((r) => r.status === "resolved");
  const likes = mine.reduce((n, r) => n + r.likes, 0);
  const [tab, setTab] = useState<Tab>("active");
  const shown = (tab === "active" ? active : resolved).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const since = new Date(profile.memberSince).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const stats = [
    { label: "Reports filed", value: mine.length },
    { label: "Still open", value: active.length },
    { label: "Resolved", value: resolved.length },
    { label: "Likes received", value: likes },
  ];
  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "active", label: "Open", n: active.length },
    { id: "resolved", label: "Resolved", n: resolved.length },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 lg:p-8">
      <header className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div aria-hidden className="h-28 bg-gradient-to-br from-brand-deep to-brand lg:h-32" />
        <div className="px-5 pb-5 lg:px-7 lg:pb-6">
          <div className="-mt-12 flex items-end justify-between gap-3">
            <span className="inline-block rounded-full ring-4 ring-surface"><Avatar name={name} size={96} /></span>
            <Link href="/settings" className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-slate-50">
              <SettingsIcon size={16} aria-hidden /> Edit profile
            </Link>
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold lg:text-3xl">{name}</h1>
          <p className="mt-0.5 text-sm text-muted">{handle ? `@${handle} · ` : ""}Member since {since}</p>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-4">
            <dd className="font-display text-3xl font-bold">{compact(value)}</dd>
            <dt className="text-sm text-muted">{label}</dt>
          </div>
        ))}
      </dl>

      <section aria-label="Your reports">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">Your reports</h2>
          <div role="tablist" aria-label="Filter your reports" className="grid grid-cols-2 rounded-full bg-slate-200/70 p-1">
            {tabs.map(({ id, label, n }) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${tab === id ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"}`}>
                {label} <span className="ml-0.5 font-medium text-muted">{n}</span>
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
            {tab === "active"
              ? mine.length === 0
                ? "You haven't reported anything yet. Use Add report in the menu when you spot a problem."
                : "Nothing open right now. Everything you've reported has been resolved."
              : "None of your reports are resolved yet. They'll appear here when the city closes them."}
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            {shown.map((r) => (
              <li key={r.id}><ReportListItem report={r} active={false} showProgress={tab === "active"} /></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
