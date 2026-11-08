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
}

export const RADIUS_CHOICES = [1, 2, 5, 0] as const;
export const DEFAULT_RADIUS_KM = 2;
/** If the nearest report is further away than this, the person is outside the area we cover. */
export const COVERAGE_KM = 40;

const DEFAULT: NearbyPrefs = { radiusKm: DEFAULT_RADIUS_KM, chosen: false };
const store = createStore<NearbyPrefs>("uv-nearby", DEFAULT);

export function useNearby() {
  const prefs = store.use();
  const center: LatLng | null = prefs.lat !== undefined && prefs.lng !== undefined ? { lat: prefs.lat, lng: prefs.lng } : null;
  return { prefs, center };
}

export const setRadius = (radiusKm: number) => store.set({ ...store.getSnapshot(), radiusKm, chosen: true });
export const setLocation = (p: LatLng, source: "gps" | "city") =>
  store.set({ ...store.getSnapshot(), lat: p.lat, lng: p.lng, source, chosen: true });
export const showWholeCity = () => store.set({ ...store.getSnapshot(), radiusKm: 0, chosen: true });
export const exploreAddis = () => store.set({ ...store.getSnapshot(), ...{ lat: ADDIS.lat, lng: ADDIS.lng }, source: "city", radiusKm: 5, chosen: true });

export type LocateError = "denied" | "unavailable" | "timeout";

/** Asks the browser where the person is. Must be called from a click so the permission prompt is expected. */
export function locate(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) { reject("unavailable" satisfies LocateError); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject((err.code === 1 ? "denied" : err.code === 3 ? "timeout" : "unavailable") satisfies LocateError),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}

/** If they already said yes before, quietly refresh their position (no new permission prompt). */
export function refreshLocationIfAllowed() {
  const prefs = store.getSnapshot();
  if (prefs.source !== "gps" || !navigator.permissions?.query) return;
  navigator.permissions.query({ name: "geolocation" }).then((status) => {
    if (status.state === "granted") locate().then((p) => {
      const cur = store.getSnapshot();
      if (cur.source === "gps") store.set({ ...cur, lat: p.lat, lng: p.lng });
    }).catch(() => {});
  }).catch(() => {});
}

export type NearbyMode = "near" | "all" | "far";
export interface NearbyResult<T extends Report> {
  list: T[];
  mode: NearbyMode;     // near: filtered by distance. all: nothing to filter by. far: outside our coverage, showing everything.
  nearbyCount: number;  // how many are inside the radius
  total: number;
}

export function applyNearby<T extends Report>(reports: T[], center: LatLng | null, radiusKm: number): NearbyResult<T> {
  const total = reports.length;
  if (!center) return { list: reports, mode: "all", nearbyCount: total, total };

  const withDistance = reports.map((r) => ({ ...r, distanceKm: distanceKm(center, { lat: r.lat, lng: r.lng }) }));
  const nearest = withDistance.reduce((m, r) => Math.min(m, r.distanceKm), Infinity);
  if (total > 0 && nearest > COVERAGE_KM) return { list: reports, mode: "far", nearbyCount: 0, total };
  if (radiusKm <= 0) return { list: withDistance, mode: "all", nearbyCount: total, total };

  const inside = withDistance.filter((r) => r.distanceKm <= radiusKm).sort((a, b) => a.distanceKm - b.distanceKm);
  return { list: inside, mode: "near", nearbyCount: inside.length, total };
}

export function useNearbyReports<T extends Report>(reports: T[]): NearbyResult<T> {
  const { prefs, center } = useNearby();
  return useMemo(() => applyNearby(reports, center, prefs.radiusKm), [reports, center, prefs.radiusKm]);
}
