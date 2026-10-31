"use client";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";

export function CategoryChips({
  value, onChange,
}: { value: CategoryId | null; onChange: (c: CategoryId | null) => void }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-1 lg:px-0" role="group" aria-label="Filter by category">
      {CATEGORIES.map(({ id, label, Icon, color }) => {
        const on = value === id;
        return (
          <button
            key={id}
            aria-pressed={on}
            onClick={() => onChange(on ? null : id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium shadow-card transition-colors ${
              on ? "border-transparent text-white" : "border-line bg-surface text-ink hover:bg-slate-50"
            }`}
            style={on ? { background: color } : undefined}
          >
            <Icon size={16} aria-hidden style={on ? undefined : { color }} /> {label}
          </button>
        );
      })}
    </div>
  );
}
