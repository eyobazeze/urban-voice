import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Staff sign in" };

export default function GovLoginPage({ searchParams }: PageProps<"/gov/login">) {
  return (
    <Suspense fallback={<div className="h-80 w-full max-w-md animate-pulse rounded-2xl bg-slate-100" aria-busy />}>
      <Login searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { next, error } = await searchParams;
  return (
    <AuthForm
      mode="login" portal="gov"
      next={typeof next === "string" ? next : undefined}
      notice={
        error === "no-access" ? "This account doesn't have staff access. Ask an administrator to enable it, or head to the citizen site."
        : error === "callback" ? "That confirmation link didn't work or has expired. Sign in, or ask an administrator for help." : undefined
      }
    />
  );
}
