// Small hand-drawn SVG/CSS charts: no chart library, so they render the same on the server and in the browser.
import { compact } from "@/lib/format";

export interface Series { name: string; color: string; values: number[] }

export function LineChart({ labels, series, label }: { labels: string[]; series: Series[]; label: string }) {
  const W = 640, H = 250, L = 38, R = 14, T = 14, B = 30;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const top = Math.max(4, Math.ceil(max / 4) * 4);
  const n = labels.length;
  const x = (i: number) => L + (n === 1 ? 0 : (i * (W - L - R)) / (n - 1));
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const ticks = [0, 1, 2, 3, 4].map((t) => (top / 4) * t);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#e6e8ee" strokeDasharray={t === 0 ? undefined : "3 4"} />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#6d717f">{compact(Math.round(t))}</text>
        </g>
      ))}
      {labels.map((l, i) => (i % 2 === (n - 1) % 2 ? <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#6d717f">{l}</text> : null))}
      {series.map((s) => (
        <g key={s.name}>
          <polyline fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" style={{ stroke: s.color }}
            points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
          {s.values.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r="3.5" style={{ fill: s.color }} stroke="#fff" strokeWidth="1.5">
              <title>{`${labels[i]}: ${v} ${s.name.toLowerCase()}`}</title>
            </circle>
          ))}
        </g>
      ))}
    </svg>
  );
}

export function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
      {items.map((i) => (
        <li key={i.name} className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full" style={{ background: i.color }} /> {i.name}
        </li>
      ))}
    </ul>
  );
}

export function Donut({ slices, centerLabel }: { slices: { label: string; value: number; color: string }[]; centerLabel: string }) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const R = 68, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <svg viewBox="0 0 200 200" role="img" aria-label={`${centerLabel}: ${total}`} className="size-48 shrink-0 -rotate-90">
        <circle cx="100" cy="100" r={R} fill="none" stroke="#eef0f4" strokeWidth="30" />
        {total > 0 && slices.map((s) => {
          const len = (s.value / total) * C;
          const el = (
            <circle key={s.label} cx="100" cy="100" r={R} fill="none" strokeWidth="30"
              style={{ stroke: s.color }} strokeDasharray={`${Math.max(0, len - 1.5)} ${C - Math.max(0, len - 1.5)}`} strokeDashoffset={-offset}>
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
        <g transform="rotate(90 100 100)" textAnchor="middle">
          <text x="100" y="102" fontSize="30" fontWeight="700" fill="#1c2230">{total}</text>
          <text x="100" y="122" fontSize="12" fill="#6d717f">{centerLabel}</text>
        </g>
      </svg>
      <ul className="w-full min-w-0 flex-1 space-y-2.5 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="flex-1 truncate">{s.label}</span>
            <span className="font-medium">{total ? Math.round((s.value / total) * 100) : 0}%</span>
            <span className="w-9 text-right text-muted">({s.value})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarList({ items, max, unit = "" }: {
  items: { label: string; value: number; color?: string; note?: string }[]; max?: number; unit?: string;
}) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{i.label}</span>
            <span className="shrink-0 text-muted">{i.note ?? `${i.value}${unit}`}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${Math.max(3, (i.value / top) * 100)}%`, background: i.color ?? "var(--color-brand)" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function GroupedBars({ labels, a, b, aName, bName, aColor, bColor }: {
  labels: string[]; a: number[]; b: number[]; aName: string; bName: string; aColor: string; bColor: string;
}) {
  const top = Math.max(1, ...a, ...b);
  return (
    <div role="img" aria-label={`${aName} and ${bName} per week`}>
      <div className="flex h-44 items-end gap-1.5 border-b border-line">
        {labels.map((l, i) => (
          <div key={l + i} className="flex h-full flex-1 items-end justify-center gap-0.5">
            <div className="w-full max-w-3 rounded-t" style={{ height: `${(a[i] / top) * 100}%`, background: aColor, minHeight: a[i] ? 3 : 0 }} title={`${l}: ${a[i]} ${aName.toLowerCase()}`} />
            <div className="w-full max-w-3 rounded-t" style={{ height: `${(b[i] / top) * 100}%`, background: bColor, minHeight: b[i] ? 3 : 0 }} title={`${l}: ${b[i]} ${bName.toLowerCase()}`} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5 text-[10px] text-muted">
        {labels.map((l, i) => <span key={l + i} className="flex-1 text-center">{i % 2 === (labels.length - 1) % 2 ? l : ""}</span>)}
      </div>
    </div>
  );
}
