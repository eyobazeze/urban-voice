import { CheckCircle2, Construction, Lightbulb, MapPin, Send, Trash2 } from "lucide-react";

// Decorative product preview for the sign-in screens: shows what the app does instead of just saying it.
export function AuthStreets() {
  return (
    <svg aria-hidden viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 size-full opacity-[0.2]">
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <path d="M-40 180C150 150 260 300 420 270S690 150 860 230" strokeWidth="14" />
        <path d="M120-40C150 140 90 260 190 400S300 640 260 940" strokeWidth="12" />
        <path d="M-40 560C140 520 300 600 470 540S730 430 860 480" strokeWidth="12" />
        <path d="M560-40C520 160 640 300 600 470S520 760 640 940" strokeWidth="10" />
        <path d="M-40 380C100 400 240 350 360 400" strokeWidth="5" />
        <path d="M400 640C520 700 640 690 860 760" strokeWidth="5" />
        <path d="M300 100C330 200 420 190 470 120" strokeWidth="4" />
        <path d="M60 760C180 720 230 800 340 770" strokeWidth="4" />
      </g>
      <circle cx="660" cy="130" r="150" fill="#fff" opacity="0.05" />
      <circle cx="90" cy="800" r="190" fill="#fff" opacity="0.05" />
    </svg>
  );
}

function Pin({ color, className }: { color: string; className: string }) {
  return (
    <span aria-hidden className={`absolute grid size-9 place-items-center ${className}`}>
      <span className="grid size-9 -rotate-45 place-items-center rounded-[50%_50%_50%_0] border-[3px] border-white shadow-lg" style={{ background: color }}>
        <i className="size-2 rotate-45 rounded-full bg-white" />
      </span>
    </span>
  );
}

export function AuthArt({ variant }: { variant: "citizen" | "gov" }) {
  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[480px]" aria-hidden>
      {variant === "citizen" ? (
        <>
          <Pin color="#e0a100" className="left-[6%] top-[4%]" />
          <Pin color="#0088e8" className="right-[8%] top-[20%]" />
          <Pin color="#c2255c" className="bottom-[8%] left-[10%]" />

          <div className="absolute left-[4%] top-[14%] w-[78%] rounded-3xl bg-white p-4 text-ink shadow-[0_24px_50px_-18px_rgb(0_0_0/0.55)]">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-orange-50 text-orange-700"><Construction size={20} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-orange-700">Roads</p>
                <p className="text-[11px] text-slate-500">Reported by a neighbour · 2h ago</p>
              </div>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">In progress</span>
            </div>
            <p className="mt-3 font-display text-[17px] font-semibold leading-snug">Deep pothole outside the church gate</p>
            <div className="mt-3 flex gap-1">
              {[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < 3 ? "bg-brand" : "bg-slate-200"}`} />)}
            </div>
            <p className="mt-1.5 text-[11px] font-semibold text-brand-deep">Step 3 of 4 · In progress</p>
            <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500"><MapPin size={12} /> Bole · 350 m away · 128 neighbours back this</p>
          </div>

          <div className="absolute bottom-[2%] right-[2%] flex w-[64%] items-center gap-3 rounded-2xl bg-white/95 p-3 text-ink shadow-[0_20px_40px_-16px_rgb(0_0_0/0.55)] backdrop-blur">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-brand"><CheckCircle2 size={20} /></span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold">Resolved in 3 days</p>
              <p className="truncate text-[11px] text-slate-500">Streetlights fixed on Kazanchis walkway</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <Pin color="#dc3545" className="right-[10%] top-[3%]" />
          <Pin color="#e69a00" className="bottom-[10%] left-[8%]" />

          <div className="absolute left-[2%] top-[10%] w-[82%] rounded-3xl bg-white p-4 text-ink shadow-[0_24px_50px_-18px_rgb(0_0_0/0.55)]">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-slate-500">Waiting for review</p>
                <p className="font-display text-4xl font-bold leading-none">8</p>
              </div>
              <div className="flex h-12 items-end gap-1.5">
                {[40, 65, 50, 85, 60, 100, 70].map((h, i) => <span key={i} className="w-3 rounded-t bg-brand/80" style={{ height: `${h}%` }} />)}
              </div>
            </div>
            <div className="mt-3.5 flex items-center gap-2.5 rounded-2xl bg-slate-50 p-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-amber-50 text-amber-600"><Lightbulb size={16} /></span>
              <p className="min-w-0 flex-1 truncate text-[12px] font-medium">Five streetlights out along Kazanchis</p>
              <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold text-white">Mark in progress</span>
            </div>
            <div className="mt-2 flex items-center gap-2.5 rounded-2xl bg-slate-50 p-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-lime-50 text-lime-700"><Trash2 size={16} /></span>
              <p className="min-w-0 flex-1 truncate text-[12px] font-medium">Uncollected waste near Merkato</p>
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700">High priority</span>
            </div>
          </div>

          <div className="absolute bottom-[2%] right-[2%] flex w-[66%] items-center gap-3 rounded-2xl bg-white/95 p-3 text-ink shadow-[0_20px_40px_-16px_rgb(0_0_0/0.55)] backdrop-blur">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-600"><Send size={17} /></span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold">Citizen notified</p>
              <p className="truncate text-[11px] text-slate-500">“A crew is scheduled for Thursday”</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
