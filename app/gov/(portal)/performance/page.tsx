import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { GovPerformance } from "@/components/gov/GovPerformance";
import { serverNow } from "@/lib/clock";
import { getReports } from "@/lib/data";

export const metadata: Metadata = { title: "Performance · Staff" };

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy />}>
      <Data />
    </Suspense>
  );
}

async function Data() {
  await connection();
  return <GovPerformance reports={await getReports()} now={serverNow()} />;
}
