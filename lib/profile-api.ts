"use client";
import { updateDemoProfile } from "./demo-store";
import type { Settings } from "./profile-types";
import { createClient, isSupabaseConfigured } from "./supabase/client";

async function currentUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Please sign in again.");
  return { supabase, user: data.user };
}

export async function saveAccount(input: { name: string; handle: string }): Promise<void> {
  if (!isSupabaseConfigured()) { updateDemoProfile(input); return; }
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("profiles").update({ full_name: input.name, handle: input.handle }).eq("id", user.id);
  if (error) throw new Error(error.code === "23505" ? "That username is already taken." : "Your changes couldn't be saved. Please try again.");
  await supabase.auth.updateUser({ data: { full_name: input.name } }); // keeps the name in the menu up to date
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (!isSupabaseConfigured()) { updateDemoProfile({ settings }); return; }
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("profiles").update({ settings }).eq("id", user.id);
  if (error) throw new Error("That setting couldn't be saved. Please try again.");
}

export async function changePassword(password: string): Promise<void> {
  const { supabase } = await currentUser();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (/same/i.test(error.message)) throw new Error("Choose a password you haven't used before.");
    throw new Error("Your password couldn't be changed. Please try again.");
  }
}

/** Staff: change only the display name. */
export async function saveName(name: string): Promise<void> {
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
  if (error) throw new Error("Your name couldn't be saved. Please try again.");
  await supabase.auth.updateUser({ data: { full_name: name } });
}
