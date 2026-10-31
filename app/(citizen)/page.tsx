import { Suspense } from "react";
import { connection } from "next/server";
import { HomeExplorer } from "@/components/HomeExplorer";
import { getReports } from "@/lib/data";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<div className="h-[calc(100dvh-4rem)] animate-pulse bg-slate-200" aria-busy />}>
      <HomeData searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeData({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection(); // the feed is live data, never prerendered
  const { report } = await searchParams;
  return <HomeExplorer reports={await getReports()} initialSelectedId={typeof report === "string" ? report : null} />;
}
