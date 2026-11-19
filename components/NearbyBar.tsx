"use client";
import { useState } from "react";
import { Loader2, LocateFixed, MapPin, Globe2 } from "lucide-react";
import type { Report } from "@/lib/types";
import { TimeAgo } from "./ui/TimeAgo";
import {
  RADIUS_CHOICES, describeOutcome, isNearActive, locateAndApply, setRadius, showAllCity, useNearby,
  type NearbyResult,
} from "@/lib/nearby";

// Optional "near me" switch. The default is the whole city; this only filters when someone turns it on.
export function NearbyBar({ result, compact = false }: { result: NearbyResult<Report>; compact?: boolean }) {
  const { prefs } = useNearby();
  const near = isNearActive(prefs) && result.mode === "near";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);

  // Every tap asks the phone where it is right now, so "Near me" is never stuck on an old position
  const goNear = async () => {
    setMessage(null);
    setBusy(true);
    setMessage(describeOutcome(await locateAndApply()));
    setBusy(false);
  };
  const goCity = () => { setMessage(null); showAllCity(); };

  const seg = (on: boolean) =>
    `inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${compact ? "h-9" : "h-10"} ${on ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"}`;
  const shownKm = result.widenedTo ?? prefs.radiusKm;

  return (
    <section aria-label="Reports near you" className="space-y-2.5">
      <div role="group" aria-label="Which reports to show" className="grid grid-cols-2 rounded-full bg-slate-200/70 p-1">
        <button aria-pressed={!near} onClick={goCity} className={seg(!near)}><Globe2 size={16} aria-hidden /> All of Addis Ababa</button>
        <button aria-pressed={near} onClick={goNear} disabled={busy} className={seg(near)}>
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <LocateFixed size={16} aria-hidden />} Near me
        </button>
      </div>

      {message && (
        <p role={message.tone === "error" ? "alert" : "status"}
          className={`rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${message.tone === "error" ? "bg-rose-50 text-rose-700" : "bg-sky-50 text-sky-900"}`}>
          {message.text}
        </p>
      )}

      {near && (
        <div className="rounded-2xl border border-brand/15 bg-brand-tint/70 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2 text-sm">
              <MapPin size={16} aria-hidden className="shrink-0 text-brand-deep" />
              <span className="truncate">
                <strong>{result.nearbyCount}</strong> {result.nearbyCount === 1 ? "report" : "reports"} within <strong>{shownKm} km</strong> of you
              </span>
            </p>
            <button onClick={async () => setMessage(describeOutcome(await locateAndApply()))} aria-label="Update my location" title="Update my location"
              className="grid size-8 shrink-0 place-items-center rounded-full text-brand-deep hover:bg-white"><LocateFixed size={16} aria-hidden /></button>
          </div>
          {prefs.at && (
            <p className="mt-1 pl-6 text-[12px] text-brand-deep/70">
              Location updated <TimeAgo iso={new Date(prefs.at).toISOString()} />
            </p>
          )}
          <div role="radiogroup" aria-label="How far to look" className="mt-2.5 grid grid-cols-3 rounded-full bg-white p-1 shadow-card">
            {RADIUS_CHOICES.map((km) => (
              <button key={km} role="radio" aria-checked={prefs.radiusKm === km} onClick={() => setRadius(km)}
                className={`h-8 rounded-full text-sm font-semibold transition-colors ${prefs.radiusKm === km ? "bg-brand text-white" : "text-muted hover:text-ink"}`}>
                {km} km
              </button>
            ))}
          </div>
          {result.widenedTo && (
            <p role="status" className="mt-2.5 text-[13px] leading-relaxed text-brand-deep">
              Not much is reported within {prefs.radiusKm} km, so we included reports up to {result.widenedTo} km.{" "}
              <button onClick={() => setRadius(prefs.radiusKm)} className="font-semibold underline underline-offset-2">Just {prefs.radiusKm} km</button>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
