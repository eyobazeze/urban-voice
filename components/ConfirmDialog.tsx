"use client";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

// Uses the native <dialog> element, which traps focus and closes on Escape for free.
export function ConfirmDialog({
  open, title, children, confirmLabel, cancelLabel = "Keep it", busy = false, error, onConfirm, onCancel,
}: {
  open: boolean; title: string; children: React.ReactNode; confirmLabel: string; cancelLabel?: string;
  busy?: boolean; error?: string | null; onConfirm: () => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => { e.preventDefault(); if (!busy) onCancel(); }}
      onClick={(e) => { if (e.target === ref.current && !busy) onCancel(); }}
      className="m-auto w-[min(92vw,440px)] rounded-3xl bg-surface p-0 text-ink shadow-float backdrop:bg-black/40"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="font-display text-xl font-bold">{title}</h2>
        <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
        {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
            {busy && <Loader2 size={16} className="animate-spin" aria-hidden />} {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
