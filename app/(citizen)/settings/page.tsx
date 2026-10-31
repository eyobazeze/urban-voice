import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SettingsView } from "@/components/SettingsView";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="m-8 h-96 animate-pulse rounded-3xl bg-slate-100" aria-busy />}>
      <SettingsData />
    </Suspense>
  );
}

async function SettingsData() {
  await connection();
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/settings");
  return <SettingsView profile={profile} />;
}
