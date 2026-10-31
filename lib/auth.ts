"use client";
import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "./supabase/client";

export type AuthState =
  | { status: "demo" }
  | { status: "loading" }
  | { status: "out" }
  | { status: "in"; email: string; name: string };

export function useAuth(): AuthState {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<{ email: string; name: string } | null | undefined>(undefined);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    const toUser = (u: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined) =>
      u ? { email: u.email ?? "", name: String(u.user_metadata?.full_name ?? "") } : null;
    supabase.auth.getUser().then(({ data }) => setUser(toUser(data.user)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(toUser(session?.user)));
    return () => data.subscription.unsubscribe();
  }, [configured]);

  if (!configured) return { status: "demo" };
  if (user === undefined) return { status: "loading" };
  return user ? { status: "in", ...user } : { status: "out" };
}
