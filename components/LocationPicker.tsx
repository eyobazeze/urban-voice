"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_OPTIONS, TILE_URL } from "@/lib/map-tiles";
import { ADDIS_CENTER } from "@/lib/mock-data";

export type LatLng = [number, number];

const pin = () =>
  L.divIcon({
    className: "uv-pin is-active",
    html: '<span style="background:#1b8500"><i></i></span>',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });

function makeMarker(m: L.Map, at: L.LatLngExpression, onMove: (p: LatLng) => void) {
  const mk = L.marker(at, { draggable: true, icon: pin(), keyboard: true, title: "Report location" }).addTo(m);
  mk.on("dragend", () => { const { lat, lng } = mk.getLatLng(); onMove([lat, lng]); });
  return mk;
}

// Tap the map (or drag the pin) to say where the problem is.
export default function LocationPicker({ value, onChange }: { value: LatLng | null; onChange: (p: LatLng) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const cb = useRef(onChange);
  useEffect(() => { cb.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: true }).setView(ADDIS_CENTER, 13);
    L.tileLayer(TILE_URL, TILE_OPTIONS).addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) => {
      const p: LatLng = [e.latlng.lat, e.latlng.lng];
      if (marker.current) marker.current.setLatLng(e.latlng);
      else marker.current = makeMarker(m, e.latlng, (q) => cb.current(q));
      cb.current(p);
    });
    map.current = m;
    return () => { m.remove(); map.current = null; marker.current = null; };
  }, []);

  // Follow changes made from outside (e.g. "Use my location")
  useEffect(() => {
    const m = map.current;
    if (!m || !value) return;
    if (marker.current) marker.current.setLatLng(value);
    else marker.current = makeMarker(m, value, (q) => cb.current(q));
    if (!m.getBounds().contains(value)) m.flyTo(value, 16, { duration: 0.6 });
  }, [value]);

  return <div ref={el} className="h-full w-full" role="application" aria-label="Map: tap to set the location of the problem" />;
}
