"use client";
import { useEffect, useState } from "react";
import { Loader2, LocateFixed } from "lucide-react";
import { describeOutcome, isNearActive, locateAndApply, showAllCity, useNearby } from "@/lib/nearby";

// Phones: a floating locate button on the map, the familiar way to say "show me what's around here".
export function NearMeButton() {
  const { prefs } = useNearby();
  const active = isNearActive(prefs);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const press = async () => {
    setMessage(null);
    if (active) { showAllCity(); return; }
    setBusy(true);
    setMessage(describeOutcome(await locateAndApply())?.text ?? null);
    setBusy(false);
  };

  return (
    <div className="absolute bottom-[148px] right-4 z-[650] flex flex-col items-end gap-2 lg:hidden">
      {message && <p role="status" className="max-w-[240px] rounded-xl bg-ink px-3 py-2 text-xs leading-relaxed text-white shadow-float">{message}</p>}
      <button onClick={press} disabled={busy} aria-pressed={active} aria-label={active ? "Show all of Addis Ababa" : "Show reports near me"}
        className={`grid size-12 place-items-center rounded-full shadow-float transition-colors ${active ? "bg-brand text-white" : "bg-surface text-brand-deep"}`}>
        {busy ? <Loader2 size={20} className="animate-spin" aria-hidden /> : <LocateFixed size={20} aria-hidden />}
      </button>
    </div>
  );
}
