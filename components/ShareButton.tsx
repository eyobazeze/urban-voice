"use client";
import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import type { Report } from "@/lib/types";
import { compact } from "@/lib/format";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch { /* not allowed here (e.g. plain http): use the older method */ }
  const box = document.createElement("textarea");
  box.value = text;
  box.setAttribute("readonly", "");
  box.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(box);
  box.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(box);
  if (!ok) throw new Error("copy failed");
}

// Phones: opens the share sheet. Computers: copies the link to the report.
export function ShareButton({ report, count = 0, className, iconSize = 18 }: {
  report: Report; count?: number; className?: string; iconSize?: number;
}) {
  const [note, setNote] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const flash = (text: string) => {
    setNote(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(null), 2200);
  };

  const onClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${location.origin}/reports/${report.id}`;
    if (window.matchMedia("(pointer: coarse)").matches && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: report.title, text: `${report.title} (${report.address})`, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return; // they closed the share sheet
      }
    }
    try {
      await copyText(url);
      flash("Link copied");
    } catch {
      flash("Couldn't copy the link");
    }
  };

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={onClick} aria-label="Share this report" className={className}>
        <Share2 size={iconSize} aria-hidden /> {count > 0 && compact(count)}
      </button>
      {note && (
        <span aria-hidden className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-medium text-white shadow-float">
          {note}
        </span>
      )}
      <span role="status" className="sr-only">{note}</span>
    </span>
  );
}
