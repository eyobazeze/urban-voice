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
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full pl-1.5 pr-3.5 text-sm font-semibold shadow-card ring-1 transition-all ${
              on ? "text-white ring-transparent" : "bg-surface text-ink ring-black/[0.06] hover:-translate-y-px hover:shadow-float"
            }`}
            style={on ? { background: color } : undefined}
          >
            <span
              className="grid size-7 place-items-center rounded-full"
              style={on ? { background: "rgb(255 255 255 / 0.22)" } : { background: `color-mix(in srgb, ${color} 14%, white)`, color }}
            >
              <Icon size={15} aria-hidden />
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
