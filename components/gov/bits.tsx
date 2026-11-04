import type { LucideIcon } from "lucide-react";
import { PRIORITY_LABEL, PRIORITY_TONE, type Priority } from "@/lib/analytics";

export function Panel({ title, subtitle, action, children, className = "" }: {
  title?: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-line bg-surface p-5 lg:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, note, noteTone = "muted", Icon, tint, ink }: {
  label: string; value: string | number; note: string; noteTone?: "good" | "bad" | "muted";
  Icon: LucideIcon; tint: string; ink: string;
}) {
  const tone = noteTone === "good" ? "text-emerald-600" : noteTone === "bad" ? "text-rose-600" : "text-muted";
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-5">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl" style={{ background: tint, color: ink }}>
        <Icon size={22} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="font-display text-3xl font-bold leading-tight">{value}</p>
        <p className={`truncate text-sm ${tone}`}>{note}</p>
      </div>
    </div>
  );
}

export function PriorityPill({ priority }: { priority: Priority | null }) {
  if (!priority) return <span className="text-sm text-muted">n/a</span>;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_TONE[priority]}`}>{PRIORITY_LABEL[priority]}</span>;
}

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
