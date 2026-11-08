import Link from "next/link";
import { BarChart3, CheckCircle2, ClipboardCheck, MapPin, MapPinned, Route } from "lucide-react";
import { AuthArt, AuthStreets } from "./AuthArt";

const COPY = {
  citizen: {
    home: "/",
    tag: null as string | null,
    headline: "Report it. Track it.\nSee it fixed.",
    sub: "Tell your city what needs attention, then follow every step until it is resolved.",
    points: [
      { Icon: MapPin, text: "Drop a pin and report in under a minute" },
      { Icon: CheckCircle2, text: "Follow each report from submitted to resolved" },
      { Icon: Route, text: "See what is happening within 2 km of you" },
    ],
  },
  gov: {
    home: "/gov",
    tag: "Staff portal",
    headline: "Resolve what matters\nto your city.",
    sub: "Triage complaints, keep citizens informed, and see where your team is needed most.",
    points: [
      { Icon: ClipboardCheck, text: "Every complaint in one place, ranked by priority" },
      { Icon: Route, text: "Update a status and the citizen sees it at once" },
      { Icon: BarChart3, text: "Spot problem districts and track response times" },
    ],
  },
};

const GRADIENT = "bg-[radial-gradient(120%_80%_at_0%_0%,#1f9a00_0%,transparent_55%),linear-gradient(160deg,#0a3f00_0%,#0f5c00_55%,#146f00_100%)]";

export function AuthShell({ variant, children }: { variant: "citizen" | "gov"; children: React.ReactNode }) {
  const c = COPY[variant];
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(460px,5fr)_6fr]">
      <aside className={`relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col xl:p-14 ${GRADIENT}`}>
        <AuthStreets />
        <Link href={c.home} className="relative z-10 flex items-center gap-2.5 font-display text-xl font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-brand-deep shadow-lg"><MapPinned size={20} aria-hidden /></span>
          UrbanVoice
          {c.tag && <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold ring-1 ring-white/25">{c.tag}</span>}
        </Link>

        <div className="relative z-10 my-auto py-8"><AuthArt variant={variant} /></div>

        <div className="relative z-10">
          <h2 className="whitespace-pre-line font-display text-[40px] font-bold leading-[1.05] tracking-tight xl:text-5xl">{c.headline}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">{c.sub}</p>
          <ul className="mt-7 space-y-3">
            {c.points.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px] text-white/90">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20"><Icon size={16} aria-hidden /></span>
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs text-white/50">Built with Next.js, Supabase and OpenStreetMap</p>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col lg:min-h-0">
        {/* Phones: a compact brand header instead of the side panel */}
        <header className={`relative overflow-hidden px-6 pb-12 pt-7 text-white lg:hidden ${GRADIENT}`}>
          <Link href={c.home} className="relative flex items-center gap-2.5 font-display text-lg font-bold">
            <span className="grid size-9 place-items-center rounded-xl bg-white text-brand-deep"><MapPinned size={18} aria-hidden /></span>
            UrbanVoice{c.tag && <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">{c.tag}</span>}
          </Link>
          <p className="relative mt-5 max-w-xs whitespace-pre-line font-display text-2xl font-bold leading-tight">{c.headline}</p>
        </header>
        <main className="relative -mt-6 flex flex-1 flex-col items-center rounded-t-[2rem] bg-canvas px-6 pb-10 pt-8 lg:mt-0 lg:justify-center lg:rounded-none lg:px-12 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
