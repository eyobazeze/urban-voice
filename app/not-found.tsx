import Link from "next/link";
import { MapPinned } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas p-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand text-white shadow-card"><MapPinned size={26} aria-hidden /></span>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">We couldn&rsquo;t find that page</h1>
        <p className="mt-2 text-muted">The link may be old, or the report may have been deleted by the person who filed it.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-deep">Back to the map</Link>
          <Link href="/reports" className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-6 text-sm font-semibold hover:bg-slate-50">All reports</Link>
        </div>
      </div>
    </main>
  );
}
