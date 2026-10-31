import Link from "next/link";
import { BellRing, MapPinned, MapPin, Eye } from "lucide-react";

const POINTS = [
  { Icon: MapPin, text: "Pin problems on the map in under a minute" },
  { Icon: Eye, text: "Follow every report from submitted to resolved" },
  { Icon: BellRing, text: "See what your neighbours are raising too" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(380px,5fr)_7fr]">
      <aside className="relative hidden overflow-hidden bg-brand-deep p-10 text-white lg:flex lg:flex-col">
        <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-white/5" />
        <div aria-hidden className="absolute -bottom-32 -left-16 size-96 rounded-full bg-white/5" />
        <Link href="/" className="relative flex items-center gap-2.5 font-display text-xl font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-white text-brand-deep"><MapPinned size={19} aria-hidden /></span>
          UrbanVoice
        </Link>
        <div className="relative mt-auto">
          <h2 className="font-display text-4xl font-bold leading-tight">Report it. Track it. See it fixed.</h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/12"><Icon size={17} aria-hidden /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="flex flex-col items-center justify-center p-6 lg:p-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5 font-display text-xl font-bold lg:hidden">
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-white"><MapPinned size={19} aria-hidden /></span>
          UrbanVoice
        </Link>
        {children}
      </main>
    </div>
  );
}
