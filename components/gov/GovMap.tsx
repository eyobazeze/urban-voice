"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Report } from "@/lib/types";
import { ADDIS_CENTER } from "@/lib/mock-data";
import { STATUS_COLOR, type AreaSummary } from "@/lib/map-colors";

// The staff map: bubbles per district (sized by open complaints), or one pin per complaint.
export default function GovMap({ mode, areas, pins, selectedKey, onSelect }: {
  mode: "areas" | "pins"; areas: AreaSummary[]; pins: Report[]; selectedKey: string | null; onSelect: (key: string | null) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const select = useRef(onSelect);
  const fitted = useRef(false);
  useEffect(() => { select.current = onSelect; }, [onSelect]);

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false }).setView(ADDIS_CENTER, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    L.control.zoom({ position: "bottomright" }).addTo(m);
    m.on("click", () => select.current(null));
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => { m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const points: L.LatLngTuple[] = [];

    if (mode === "areas") {
      areas.forEach((a) => {
        const size = Math.round(Math.min(64, 30 + a.open * 4));
        const key = `area:${a.name}`;
        const on = key === selectedKey;
        L.marker([a.lat, a.lng], {
          title: `${a.name}: ${a.open} open`,
          icon: L.divIcon({
            className: "",
            iconSize: [size, size],
            html: `<span style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:50%;background:${a.color};color:#fff;font:700 ${size > 44 ? 17 : 14}px Inter,sans-serif;border:3px solid #fff;box-shadow:0 0 0 ${on ? 10 : 7}px ${a.color}38,0 4px 12px rgba(0,0,0,.25)">${a.open}</span>`,
          }),
        }).on("click", (e) => { L.DomEvent.stopPropagation(e); select.current(key); }).addTo(g);
        points.push([a.lat, a.lng]);
      });
    } else {
      pins.forEach((r) => {
        const key = `pin:${r.id}`;
        L.marker([r.lat, r.lng], {
          title: r.title,
          icon: L.divIcon({
            className: `uv-pin${key === selectedKey ? " is-active" : ""}`,
            html: `<span style="background:${STATUS_COLOR[r.status]}"><i></i></span>`,
            iconSize: [34, 34], iconAnchor: [17, 34],
          }),
        }).on("click", (e) => { L.DomEvent.stopPropagation(e); select.current(key); }).addTo(g);
        points.push([r.lat, r.lng]);
      });
    }
    if (!fitted.current && points.length) {
      m.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 14 });
      fitted.current = true;
    }
  }, [mode, areas, pins, selectedKey]);

  // Centre on whatever is selected
  useEffect(() => {
    const m = map.current;
    if (!m || !selectedKey) return;
    const [kind, id] = [selectedKey.split(":")[0], selectedKey.slice(selectedKey.indexOf(":") + 1)];
    const at = kind === "area" ? areas.find((a) => a.name === id) : pins.find((r) => r.id === id);
    if (at) m.flyTo([at.lat, "lng" in at ? at.lng : 0], Math.max(m.getZoom(), 13), { duration: 0.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  return <div ref={el} className="h-full w-full" role="application" aria-label="Map of complaints" />;
}
