import { Suspense } from "react";
import { connection } from "next/server";
import { ReportsShell } from "@/components/ReportsShell";
import { getReports } from "@/lib/data";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-[calc(100dvh-4rem)] animate-pulse bg-slate-100" aria-busy />}>
      <ReportsData>{children}</ReportsData>
    </Suspense>
  );
}

async function ReportsData({ children }: { children: React.ReactNode }) {
  await connection(); // live data, never prerendered
  const reports = await getReports();
  return <ReportsShell reports={reports}>{children}</ReportsShell>;
}
