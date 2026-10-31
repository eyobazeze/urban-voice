import { DEMO_USER } from "./mock-data";
import { DEFAULT_SETTINGS, mergeSettings, type Profile } from "./profile-types";
import { isSupabaseConfigured } from "./supabase/client";
import { createClient } from "./supabase/server";

/** The signed-in citizen's profile, or null when nobody is signed in. */
export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return {
      name: DEMO_USER.name, handle: DEMO_USER.handle, email: "selam@example.com",
      memberSince: "2026-09-01T00:00:00Z", settings: DEFAULT_SETTINGS, demo: true,
    };
  }
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from("profiles").select("full_name, handle, created_at, settings").eq("id", auth.user.id).maybeSingle();
  return {
    name: data?.full_name || String(auth.user.user_metadata?.full_name ?? ""),
    handle: data?.handle ?? "",
    email: auth.user.email ?? "",
    memberSince: data?.created_at ?? auth.user.created_at,
    settings: mergeSettings(data?.settings),
    demo: false,
  };
}
