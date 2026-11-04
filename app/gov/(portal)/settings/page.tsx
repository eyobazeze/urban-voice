import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { GovSettings } from "@/components/gov/GovSettings";
import { getStaffAccess } from "@/lib/gov";

export const metadata: Metadata = { title: "Settings · Staff" };

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy />}>
      <Data />
    </Suspense>
  );
}

async function Data() {
  await connection();
  const access = await getStaffAccess();
  if (access.status !== "ok") return null;
  return <GovSettings staff={access.staff} />;
}
