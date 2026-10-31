"use client";

export default function CitizenError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted">We couldn&rsquo;t load this page. Check your connection and try again.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep">
        Try again
      </button>
    </div>
  );
}
