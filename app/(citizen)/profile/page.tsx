import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ProfileView } from "@/components/ProfileView";
import { getReports } from "@/lib/data";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="m-8 h-96 animate-pulse rounded-3xl bg-slate-100" aria-busy />}>
      <ProfileData />
    </Suspense>
  );
}

async function ProfileData() {
  await connection();
  const [profile, reports] = await Promise.all([getProfile(), getReports()]);
  if (!profile) redirect("/login?next=/profile");
  return <ProfileView profile={profile} reports={reports} />;
}
