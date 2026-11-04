import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ComplaintsTable } from "@/components/gov/ComplaintsTable";
import { serverNow } from "@/lib/clock";
import { getReports } from "@/lib/data";

export const metadata: Metadata = { title: "Complaints · Staff" };

export default function ComplaintsPage({ searchParams }: PageProps<"/gov/complaints">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy />}>
      <Data searchParams={searchParams} />
    </Suspense>
  );
}

async function Data({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const { area, status } = await searchParams;
  const reports = await getReports();
  return <ComplaintsTable reports={reports} now={serverNow()} initialArea={typeof area === "string" ? area : "all"} initialStatus={typeof status === "string" ? status : "all"} />;
}
