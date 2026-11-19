"use client";
import { useMemo } from "react";
import { createStore } from "./demo-store";
import { ADDIS, distanceKm, type LatLng } from "./geo";
import type { Report } from "./types";

/*
 * "Near you": the feed and the map show reports within a radius of the person.
 * Their position is kept in this browser only (localStorage). It is never sent to a server.
 */

export interface NearbyPrefs {
  lat?: number;
  lng?: number;
  source?: "gps" | "city"; // where the position came from
  radiusKm: number;        // 0 means the whole city
  chosen: boolean;         // they have answered the "use my location?" question
  autoWiden?: boolean;     // widen the search by itself when very little is close (default on)
  at?: number;             // when the position was last updated (ms since 1970)
}

export const RADIUS_CHOICES = [1, 2, 5] as const;
export const DEFAULT_RADIUS_KM = 2;
/** UrbanVoice covers Addis Ababa: anyone further than this from the city centre is "outside the area". */
export const COVERAGE_KM = 40;
/** If fewer reports than this are close by, quietly look a bit wider. */
export const MIN_NEARBY = 3;
export const WIDEN_TO_KM = 5;

const DEFAULT: NearbyPrefs = { radiusKm: DEFAULT_RADIUS_KM, chosen: false };
const store = createStore<NearbyPrefs>("uv-nearby", DEFAULT);

export function useNearby() {
  const prefs = store.use();
  const center: LatLng | null = prefs.lat !== undefined && prefs.lng !== undefined ? { lat: prefs.lat, lng: prefs.lng } : null;
  return { prefs, center };
}

// Choosing a distance yourself switches the automatic widening off: they asked for exactly that distance.
export const setRadius = (radiusKm: number) => store.set({ ...store.getSnapshot(), radiusKm, chosen: true, autoWiden: false });
/** Back to the default distance without treating it as the person's own choice. */
export const resetRadius = () => store.set({ ...store.getSnapshot(), radiusKm: DEFAULT_RADIUS_KM, chosen: true });
export const setAutoWiden = (on: boolean) => store.set({ ...store.getSnapshot(), autoWiden: on });
export const isOutsideCoverage = (p: LatLng) => distanceKm(p, ADDIS) > COVERAGE_KM;
/** Show every report in the city (any saved position is kept, so switching back to "near me" is instant). */
export const showAllCity = () => store.set({ ...store.getSnapshot(), radiusKm: 0, chosen: true });
export const isNearActive = (p: NearbyPrefs) => p.lat !== undefined && p.lng !== undefined && p.radiusKm > 0;
export const setLocation = (p: LatLng, source: "gps" | "city") =>
  store.set({ ...store.getSnapshot(), lat: p.lat, lng: p.lng, source, chosen: true, at: Date.now() });

export type LocateOutcome = "near" | "outside" | LocateError;
export type LocateError = "denied" | "unavailable" | "timeout";

/** Asks the browser where the person is. Must be called from a click so the permission prompt is expected. */
export function locate(opts: { fresh?: boolean } = {}): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) { reject("unavailable" satisfies LocateError); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject((err.code === 1 ? "denied" : err.code === 3 ? "timeout" : "unavailable") satisfies LocateError),
      // Phones answer much faster with an approximate fix, which is plenty for a 1 to 5 km radius.
      // "fresh" never accepts an old cached position: used whenever the person taps "Near me".
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: opts.fresh ? 0 : 60_000 },
    );
  });
}

/** Finds the person and switches "near me" on. Returns what happened so the caller can explain it. */
export async function locateAndApply(): Promise<LocateOutcome> {
  try {
    const p = await locate({ fresh: true });
    if (isOutsideCoverage(p)) { showAllCity(); return "outside"; } // not in Addis Ababa: keep showing the city, don't keep their position
    const cur = store.getSnapshot();
    store.set({ ...cur, lat: p.lat, lng: p.lng, source: "gps", chosen: true, at: Date.now(), radiusKm: cur.radiusKm > 0 ? cur.radiusKm : DEFAULT_RADIUS_KM });
    return "near";
  } catch (e) {
    return (e as LocateError) ?? "unavailable";
  }
}

/** Plain-language explanation for anything other than success. */
export function describeOutcome(o: LocateOutcome): { tone: "info" | "error"; text: string } | null {
  switch (o) {
    case "near": return null;
    case "outside": return { tone: "info", text: "You're outside Addis Ababa, so we're showing the whole city." };
    case "denied": return { tone: "error", text: "Location is blocked for this site. Allow it in your browser's address bar to see what's near you." };
    case "timeout": return { tone: "error", text: "Finding your location took too long. Please try again." };
    default: return { tone: "error", text: "We couldn't work out where you are. Please try again." };
  }
}

/** If they already said yes before, quietly refresh their position (no new permission prompt). */
export function refreshLocationIfAllowed() {
  const prefs = store.getSnapshot();
  if (prefs.source !== "gps" || !navigator.permissions?.query) return;
  navigator.permissions.query({ name: "geolocation" }).then((status) => {
    if (status.state === "granted") locate().then((p) => {
      const cur = store.getSnapshot();
      if (cur.source !== "gps") return;
      if (isOutsideCoverage(p)) showAllCity();
      else store.set({ ...cur, lat: p.lat, lng: p.lng, at: Date.now() });
    }).catch(() => {});
  }).catch(() => {});
}

export type NearbyMode = "near" | "all" | "far";
export interface NearbyResult<T extends Report> {
  list: T[];
  mode: NearbyMode;     // near: filtered by distance. all: nothing to filter by. far: outside our coverage, showing everything.
  nearbyCount: number;  // how many are inside the radius
  total: number;
  widenedTo?: number;   // we looked this far (km) because very little was close by
}

export function applyNearby<T extends Report>(reports: T[], center: LatLng | null, radiusKm: number, autoWiden = true): NearbyResult<T> {
  const total = reports.length;
  if (!center) return { list: reports, mode: "all", nearbyCount: total, total };
  // Outside Addis Ababa there is nothing "near" to show, so show the whole city rather than an empty feed
  if (isOutsideCoverage(center)) return { list: reports, mode: "far", nearbyCount: 0, total };

  const withDistance = reports.map((r) => ({ ...r, distanceKm: distanceKm(center, { lat: r.lat, lng: r.lng }) }));
  if (radiusKm <= 0) return { list: withDistance, mode: "all", nearbyCount: total, total };

  const within = (km: number) => withDistance.filter((r) => r.distanceKm <= km).sort((a, b) => a.distanceKm - b.distanceKm);
  const inside = within(radiusKm);
  if (autoWiden && inside.length < MIN_NEARBY && radiusKm < WIDEN_TO_KM) {
    const wider = within(WIDEN_TO_KM);
    if (wider.length > inside.length) return { list: wider, mode: "near", nearbyCount: wider.length, total, widenedTo: WIDEN_TO_KM };
  }
  return { list: inside, mode: "near", nearbyCount: inside.length, total };
}

export function useNearbyReports<T extends Report>(reports: T[]): NearbyResult<T> {
  const { prefs, center } = useNearby();
  return useMemo(() => applyNearby(reports, center, prefs.radiusKm, prefs.autoWiden !== false), [reports, center, prefs.radiusKm, prefs.autoWiden]);
}
