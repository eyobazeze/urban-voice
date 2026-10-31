"use client";
import Link from "next/link";
import { useDemoReports, useHydrated } from "@/lib/demo-store";
import { ReportDetail } from "./ReportDetail";

// Reports filed in demo mode are kept in this browser, so they are looked up here instead of on the server.
export function DemoReport({ id }: { id: string }) {
  const demo = useDemoReports();
  const hydrated = useHydrated();
  const report = demo.find((r) => r.id === id);

  if (!hydrated) return <div className="m-8 h-96 animate-pulse rounded-2xl bg-slate-100" aria-busy />;
  if (!report) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Report not found</h1>
        <p className="mt-2 text-muted">Demo reports are only stored in the browser that created them.</p>
        <Link href="/reports" className="mt-5 inline-block font-semibold text-brand-deep hover:underline">Back to reports</Link>
      </div>
    );
  }
  return <ReportDetail report={report} initialComments={[]} />;
}
