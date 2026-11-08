"use client";
import { useState } from "react";
import { Compass, Loader2, LocateFixed, MapPin, Navigation } from "lucide-react";
import type { Report } from "@/lib/types";
import {
  DEFAULT_RADIUS_KM, RADIUS_CHOICES, exploreAddis, locate, setLocation, setRadius, showWholeCity, useNearby,
  type LocateError, type NearbyResult,
} from "@/lib/nearby";

const MESSAGE: Record<LocateError, string> = {
  denied: "Location is blocked for this site. Allow it in your browser's address bar, or explore Addis Ababa instead.",
  unavailable: "We couldn't work out where you are. Try again, or explore Addis Ababa instead.",
  timeout: "Finding your location took too long. Try again, or explore Addis Ababa instead.",
};

// Tells people what they are looking at (reports within X km) and lets them change it.
export function NearbyBar({ result, compact = false }: { result: NearbyResult<Report>; compact?: boolean }) {
  const { prefs, center } = useNearby();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findMe = async () => {
    setBusy(true);
    setError(null);
    try {
      const p = await locate();
      setLocation(p, "gps");
      if (prefs.radiusKm === 0) setRadius(DEFAULT_RADIUS_KM);
    } catch (e) {
      setError(MESSAGE[e as LocateError] ?? MESSAGE.unavailable);
    } finally {
      setBusy(false);
    }
  };

  const problem = error && <p role="alert" className="mt-3 rounded-xl bg-white/90 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>;
  const spinner = busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <LocateFixed size={16} aria-hidden />;

  // 1. First visit: ask, and explain why
  if (!prefs.chosen) {
    return (
      <section aria-label="Reports near you" className={`rounded-3xl bg-gradient-to-br from-brand-deep to-brand text-white shadow-float ${compact ? "p-4" : "p-5"}`}>
        <div className="flex items-start gap-3.5">
          <span className={`grid shrink-0 place-items-center rounded-2xl bg-white/15 ${compact ? "size-9" : "size-11"}`}><Navigation size={compact ? 18 : 21} aria-hidden /></span>
          <div>
            <h2 className={`font-display font-bold leading-snug ${compact ? "text-base" : "text-lg"}`}>See what&rsquo;s happening near you</h2>
            <p className={`mt-1 leading-relaxed text-white/85 ${compact ? "text-[13px]" : "text-sm"}`}>
              {compact
                ? `Reports within ${DEFAULT_RADIUS_KM} km of you. Your location stays in your browser.`
                : `We\u2019ll show reports within ${DEFAULT_RADIUS_KM} km of where you are. Your location stays in your browser and is never saved on our servers.`}
            </p>
          </div>
        </div>
        <div className={`flex flex-wrap items-center gap-2 ${compact ? "mt-3" : "mt-4"}`}>
          <button onClick={findMe} disabled={busy} className={`inline-flex items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-brand-deep hover:bg-brand-tint disabled:opacity-70 ${compact ? "h-10" : "h-11"}`}>
            {spinner} Use my location
          </button>
          <button onClick={showWholeCity} className={`inline-flex items-center rounded-full px-4 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/10 ${compact ? "h-10" : "h-11"}`}>
            {compact ? "Whole city" : "Show the whole city"}
          </button>
          <button onClick={exploreAddis} className={`inline-flex items-center gap-1.5 px-2 text-sm font-medium text-white/85 underline-offset-4 hover:underline ${compact ? "h-9" : "h-11"}`}>
            <Compass size={15} aria-hidden /> Explore Addis Ababa
          </button>
        </div>
        {problem}
      </section>
    );
  }

  // 2. Outside the area these reports cover: show everything and say why
  if (result.mode === "far") {
    return (
      <section aria-label="Reports near you" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <p className="flex items-start gap-2.5 text-sm leading-relaxed">
          <Compass size={18} aria-hidden className="mt-0.5 shrink-0" />
          <span>You&rsquo;re outside the area these reports cover, so you&rsquo;re seeing all of them.</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={exploreAddis} className="inline-flex h-9 items-center rounded-full bg-amber-900 px-4 text-sm font-semibold text-white hover:bg-amber-950">Explore Addis Ababa</button>
          <button onClick={findMe} disabled={busy} className="inline-flex h-9 items-center gap-2 rounded-full border border-amber-300 px-4 text-sm font-semibold hover:bg-amber-100 disabled:opacity-70">{spinner} Update my location</button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
      </section>
    );
  }

  // 3. Whole city
  if (prefs.radiusKm === 0 || !center) {
    return (
      <section aria-label="Reports near you" className="rounded-2xl border border-line bg-surface p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm"><MapPin size={16} aria-hidden className="text-muted" /> Showing every report in the city</p>
          <button onClick={center ? () => setRadius(DEFAULT_RADIUS_KM) : findMe} disabled={busy}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-brand-tint px-4 text-sm font-semibold text-brand-deep hover:bg-brand/15 disabled:opacity-70">
            {spinner} Near me
          </button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-rose-600">{error}</p>}
      </section>
    );
  }

  // 4. Near you: the normal state
  return (
    <section aria-label="Reports near you" className="rounded-2xl border border-brand/15 bg-brand-tint/70 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-sm">
          <MapPin size={16} aria-hidden className="shrink-0 text-brand-deep" />
          <span className="truncate">
            <strong>{result.nearbyCount}</strong> {result.nearbyCount === 1 ? "report" : "reports"} within <strong>{prefs.radiusKm} km</strong> of {prefs.source === "gps" ? "you" : "central Addis Ababa"}
          </span>
        </p>
        {prefs.source === "gps" && (
          <button onClick={findMe} disabled={busy} aria-label="Update my location" title="Update my location"
            className="grid size-8 shrink-0 place-items-center rounded-full text-brand-deep hover:bg-white disabled:opacity-60">{spinner}</button>
        )}
      </div>
      <div role="radiogroup" aria-label="How far to look" className="mt-2.5 grid grid-cols-4 rounded-full bg-white p-1 shadow-card">
        {RADIUS_CHOICES.map((km) => (
          <button key={km} role="radio" aria-checked={prefs.radiusKm === km} onClick={() => (km === 0 ? showWholeCity() : setRadius(km))}
            className={`h-8 rounded-full text-sm font-semibold transition-colors ${prefs.radiusKm === km ? "bg-brand text-white" : "text-muted hover:text-ink"}`}>
            {km === 0 ? "City" : `${km} km`}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-rose-600">{error}</p>}
    </section>
  );
}
