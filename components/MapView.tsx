"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Report } from "@/lib/types";
import { categoryById } from "@/lib/categories";
import { ADDIS_CENTER } from "@/lib/mock-data";

function pinIcon(color: string, active: boolean) {
  return L.divIcon({
    className: `uv-pin${active ? " is-active" : ""}`,
    html: `<span style="background:${color}"><i></i></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });
}

export default function MapView({
  reports, selectedId, onSelect, onBackgroundClick,
}: {
  reports: Report[]; selectedId: string | null; onSelect: (id: string) => void;
  onBackgroundClick?: () => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const savedView = useRef<{ center: L.LatLng; zoom: number } | null>(null);
  const fitted = useRef(false);
  const bgClick = useRef(onBackgroundClick);
  const selectRef = useRef(onSelect);
  useEffect(() => { bgClick.current = onBackgroundClick; selectRef.current = onSelect; }, [onBackgroundClick, onSelect]);

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(ADDIS_CENTER, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    L.control.zoom({ position: "topright" }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on("click", () => bgClick.current?.());
    map.current = m;
    const markerStore = markers.current;
    return () => { m.remove(); map.current = null; markerStore.clear(); };
  }, []);

  // Draw pins whenever the visible reports change
  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();
    markers.current.clear();
    reports.forEach((r) => {
      const marker = L.marker([r.lat, r.lng], {
        icon: pinIcon(categoryById(r.category).color.replace(/var\((.+)\)/, (_, v) =>
          getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "#249a00"), r.id === selectedId),
        title: r.title,
        keyboard: true,
      }).on("click", () => selectRef.current(r.id));
      marker.addTo(layer.current!);
      markers.current.set(r.id, marker);
    });
    // First draw: frame every pin so nothing starts off-screen
    if (!fitted.current && reports.length && map.current) {
      fitted.current = true;
      map.current.fitBounds(L.latLngBounds(reports.map((r) => [r.lat, r.lng] as [number, number])), {
        paddingTopLeft: [40, 120], paddingBottomRight: [40, 160], maxZoom: 14, animate: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports]);

  // Highlight and fly to the selected report
  const hasSelected = reports.some((r) => r.id === selectedId);
  useEffect(() => {
    markers.current.forEach((marker, id) => {
      marker.getElement()?.classList.toggle("is-active", id === selectedId);
    });
    const m = map.current;
    if (!m) return;
    const r = reports.find((x) => x.id === selectedId);
    if (r) {
      // Remember the view from before the first click so closing can go back to it
      if (!savedView.current) savedView.current = { center: m.getCenter(), zoom: m.getZoom() };
      // Aim a little below the pin so it clears the preview card or sheet.
      const z = Math.max(m.getZoom(), 15);
      const phone = !window.matchMedia("(min-width: 1024px)").matches;
      const inset = phone ? m.getSize().y * 0.5 : 160; // half-open sheet on phones, preview card on desktop
      const target = m.unproject(m.project([r.lat, r.lng], z).add([0, inset / 2]), z);
      m.flyTo(target, z, { duration: 0.6 });
    } else if (savedView.current) {
      m.flyTo(savedView.current.center, savedView.current.zoom, { duration: 0.6 });
      savedView.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, hasSelected]);

  return <div ref={el} className="uv-home-map h-full w-full" role="application" aria-label="Map of reported issues" />;
}
