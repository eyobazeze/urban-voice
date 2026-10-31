"use client";

export function Switch({ checked, onChange, labelledBy, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; labelledBy: string; disabled?: boolean;
}) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-labelledby={labelledBy} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-brand" : "bg-slate-300"}`}
    >
      <span className={`absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}
