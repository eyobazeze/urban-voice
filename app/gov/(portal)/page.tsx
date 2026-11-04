import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { GovDashboard } from "@/components/gov/GovDashboard";
import { serverNow } from "@/lib/clock";
import { getReports } from "@/lib/data";
import { getStaffAccess } from "@/lib/gov";

export const metadata: Metadata = { title: "Dashboard · Staff" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy />}>
      <Data />
    </Suspense>
  );
}

async function Data() {
  await connection();
  const [reports, access] = await Promise.all([getReports(), getStaffAccess()]);
  if (access.status !== "ok") return null; // the layout has already redirected
  return <GovDashboard reports={reports} staff={access.staff} now={serverNow()} />;
}
