"use client";
import { demoAssign, demoSetStatus } from "./demo-store";
import type { Staff } from "./gov-types";
import { createClient, isSupabaseConfigured } from "./supabase/client";
import type { Report, ReportStatus } from "./types";

/** Moves a report to a new status (and/or adds a note). Citizens see it on their progress tracker. */
export async function setStatus(report: Report, status: ReportStatus, note: string, staff: Staff): Promise<void> {
  if (!isSupabaseConfigured()) { demoSetStatus(report, status, note, staff.name); return; }
  const { error } = await createClient().rpc("gov_set_status", {
    p_report: report.id, p_status: status, p_note: note.trim() || null,
  });
  if (error) throw new Error("The update couldn't be saved. Check that this account has staff access and try again.");
}

export async function assignReport(report: Report, staff: Staff, assign: boolean): Promise<void> {
  if (!isSupabaseConfigured()) { demoAssign(report, assign ? { id: staff.id, name: staff.name } : null); return; }
  const { data, error } = await createClient()
    .from("reports").update({ assigned_to: assign ? staff.id : null }).eq("id", report.id).select("id");
  if (error || !data?.length) throw new Error("The assignment couldn't be saved. Please try again.");
}
