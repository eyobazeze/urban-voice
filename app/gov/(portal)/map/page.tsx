import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { GovMapOps } from "@/components/gov/GovMapOps";
import { serverNow } from "@/lib/clock";
import { getReports } from "@/lib/data";

export const metadata: Metadata = { title: "Map operations · Staff" };

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy />}>
      <Data />
    </Suspense>
  );
}

async function Data() {
  await connection();
  return <GovMapOps reports={await getReports()} now={serverNow()} />;
}
