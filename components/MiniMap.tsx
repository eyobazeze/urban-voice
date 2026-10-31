"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// A small, non-interactive map that shows where a report is.
export default function MiniMap({ lat, lng, color }: { lat: number; lng: number; color: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, {
      zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
      boxZoom: false, keyboard: false, touchZoom: false,
    }).setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    L.marker([lat, lng], {
      interactive: false, keyboard: false,
      icon: L.divIcon({
        className: "uv-pin is-active",
        html: `<span style="background:${color}"><i></i></span>`,
        iconSize: [34, 34], iconAnchor: [17, 34],
      }),
    }).addTo(m);
    return () => { m.remove(); };
  }, [lat, lng, color]);
  return <div ref={el} className="h-full w-full" role="img" aria-label="Map showing where the problem is" />;
}
