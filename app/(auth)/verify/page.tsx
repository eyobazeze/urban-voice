import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmail } from "@/components/VerifyEmail";

export const metadata: Metadata = { title: "Check your email" };

export default function VerifyPage({ searchParams }: PageProps<"/verify">) {
  return (
    <Suspense fallback={<div className="h-72 w-full max-w-md animate-pulse rounded-2xl bg-slate-100" aria-busy />}>
      <Verify searchParams={searchParams} />
    </Suspense>
  );
}

async function Verify({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { email } = await searchParams;
  return <VerifyEmail email={typeof email === "string" ? email : ""} />;
}
