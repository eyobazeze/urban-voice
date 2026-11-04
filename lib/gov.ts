import { DEMO_STAFF, type Staff } from "./gov-types";
import { isSupabaseConfigured } from "./supabase/client";
import { createClient } from "./supabase/server";

export type StaffAccess =
  | { status: "ok"; staff: Staff }
  | { status: "signed-out" }
  | { status: "no-access" };

/** Who is signed in to the staff portal, and are they actually staff? */
export async function getStaffAccess(): Promise<StaffAccess> {
  if (!isSupabaseConfigured()) return { status: "ok", staff: DEMO_STAFF };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { status: "signed-out" };
  const { data } = await supabase.from("profiles").select("full_name, role").eq("id", auth.user.id).maybeSingle();
  if (data?.role !== "gov") return { status: "no-access" };
  return {
    status: "ok",
    staff: { id: auth.user.id, name: data.full_name || auth.user.email || "Staff", email: auth.user.email ?? "", title: "Complaint officer", demo: false },
  };
}
