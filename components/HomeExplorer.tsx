"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, ChevronUp } from "lucide-react";
import type { CategoryId, Report } from "@/lib/types";
import MapView from "./MapLoader";
import { CategoryChips } from "./CategoryChips";
import { ReportCard } from "./ReportCard";
import { MapPreviewCard } from "./MapPreviewCard";
import { NearbyBar } from "./NearbyBar";
import { refreshLocationIfAllowed, setRadius, showWholeCity, useNearby, useNearbyReports } from "@/lib/nearby";
import { useMergedReports } from "@/lib/demo-store";

export function HomeExplorer({ reports: serverReports, initialSelectedId = null }: { reports: Report[]; initialSelectedId?: string | null }) {
  const all = useMergedReports(serverReports);
  const nearby = useNearbyReports(all); // only what is close to the person, when they have shared where they are
  const reports = nearby.list;
  const { prefs, center } = useNearby();
  useEffect(() => { refreshLocationIfAllowed(); }, []);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(initialSelectedId);
  const [sheet, setSheet] = useState<"peek" | "half" | "full">(initialSelectedId ? "half" : "peek");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter(
      (r) =>
        (!category || r.category === category) &&
        (!q || `${r.title} ${r.address} ${r.body}`.toLowerCase().includes(q)),
    );
  }, [reports, category, query]);

  // The open report lives in the address (/?report=id), so the browser's Back button returns to it
  const deselect = () => {
    setSelected(null);
    setSheet("peek");
    window.history.replaceState(null, "", "/");
  };
  const select = (id: string) => {
    if (id === selected) { deselect(); return; } // clicking the open report again closes it
    setSelected(id);
    setSheet("half");
    window.history.replaceState(null, "", `/?report=${encodeURIComponent(id)}`);
  };

  // Bring the selected report into view in the feed (the sheet may still be resizing on phones)
  useEffect(() => {
    if (!selected) return;
    const show = () =>
      document.querySelectorAll(`[data-report-id="${selected}"]`).forEach((el) =>
        el.scrollIntoView({ block: "center", behavior: "smooth" }),
      );
    const t1 = setTimeout(show, 60);
    const t2 = setTimeout(show, 380);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [selected]);
  const preview = visible.find((r) => r.id === selected) ?? null;

  const feed = (
    <ul className="flex flex-col gap-3 p-4" aria-label="Nearby reports">
      {visible.length === 0 && (
        <li className="rounded-3xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          {nearby.mode === "near" && nearby.nearbyCount === 0 ? (
            <>
              <p className="font-medium text-ink">Nothing reported within {prefs.radiusKm} km yet.</p>
              <p className="mt-1">Try looking a bit wider, or be the first to report something here.</p>
              <div className="mt-4 flex justify-center gap-2">
                {prefs.radiusKm < 5 && <button onClick={() => setRadius(5)} className="h-9 rounded-full bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep">Look within 5 km</button>}
                <button onClick={showWholeCity} className="h-9 rounded-full border border-line px-4 text-sm font-semibold text-ink hover:bg-slate-50">Show the whole city</button>
              </div>
            </>
          ) : "No reports match. Try a different category or search term."}
        </li>
      )}
      {visible.map((r) => (
        <li key={r.id}><ReportCard report={r} active={r.id === selected} onSelect={select} /></li>
      ))}
    </ul>
  );

  const searchBar = (
    <label className="relative block">
      <span className="sr-only">Search reports and places</span>
      <Search size={18} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search streets, places, issues"
        className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-[15px] shadow-card placeholder:text-muted focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
      />
    </label>
  );

  return (
    <div className="relative h-[calc(100dvh-4rem)] lg:grid lg:grid-cols-[clamp(480px,42vw,640px)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
      {/* Desktop: feed column */}
      <section className="hidden min-h-0 flex-col border-r border-line bg-canvas lg:flex">
        <div className="space-y-3 p-4 pb-1">
          <h1 className="font-display text-2xl font-bold">Around you</h1>
          <NearbyBar result={nearby} />
          {searchBar}
          <CategoryChips value={category} onChange={setCategory} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{feed}</div>
      </section>

      {/* Map (full-bleed on mobile) */}
      <section className="absolute inset-0 isolate lg:relative" aria-label="Map">
        <MapView reports={visible} selectedId={selected} onSelect={select} onBackgroundClick={deselect} me={center} radiusKm={nearby.mode === "near" ? prefs.radiusKm : 0} />
        {preview && <MapPreviewCard report={preview} onClose={deselect} />}
      </section>

      {/* Mobile: search + chips float over the map */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] space-y-2 p-4 pb-0 lg:hidden">
        <div className="pointer-events-auto">{searchBar}</div>
        <div className="pointer-events-auto -mx-4"><CategoryChips value={category} onChange={setCategory} /></div>
      </div>

      {/* Mobile: first-visit question floats above the sheet */}
      {!prefs.chosen && (
        <div className="absolute inset-x-3 bottom-[148px] z-[650] lg:hidden"><NearbyBar result={nearby} compact /></div>
      )}

      {/* Mobile: bottom sheet */}
      <section
        aria-label="Nearby reports"
        className={`absolute inset-x-0 bottom-0 z-[600] flex flex-col rounded-t-3xl bg-canvas shadow-float transition-[height] duration-300 lg:hidden ${
          sheet === "full" ? "h-[78%]" : sheet === "half" ? "h-[50%]" : "h-[132px]"
        }`}
      >
        <button
          onClick={() => setSheet((v) => (v === "full" ? "peek" : "full"))}
          aria-expanded={sheet !== "peek"}
          className="flex w-full flex-col items-center gap-1 pb-2 pt-2.5"
        >
          <span className="h-1.5 w-10 rounded-full bg-slate-300" aria-hidden />
          <span className="flex items-center gap-1 text-sm font-semibold">
            {visible.length} {visible.length === 1 ? "report" : "reports"}{nearby.mode === "near" ? ` within ${prefs.radiusKm} km` : ""}
            <ChevronUp size={16} aria-hidden className={`transition-transform ${sheet === "full" ? "rotate-180" : ""}`} />
          </span>
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {prefs.chosen && <div className="px-4 pt-1"><NearbyBar result={nearby} compact /></div>}
          {feed}
        </div>
      </section>
    </div>
  );
}
