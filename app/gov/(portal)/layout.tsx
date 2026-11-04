import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { GovShell } from "@/components/gov/GovShell";
import { getStaffAccess } from "@/lib/gov";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-gov-canvas" aria-busy />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

// Only signed-in staff get past this point. Real protection also lives in the database (row-level security).
async function Gate({ children }: { children: React.ReactNode }) {
  await connection();
  const access = await getStaffAccess();
  if (access.status === "signed-out") redirect("/gov/login");
  if (access.status === "no-access") redirect("/gov/login?error=no-access");
  return <GovShell staff={access.staff}>{children}</GovShell>;
}
