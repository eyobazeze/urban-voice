"use client";
import type { CategoryId, Report } from "./types";
import { createClient, isSupabaseConfigured } from "./supabase/client";
import { addDemoReport, deleteDemoReport } from "./demo-store";
import { blobToDataUrl } from "./image";
import { DEMO_USER } from "./mock-data";

export interface NewReportInput {
  title: string;
  body: string;
  category: CategoryId;
  lat: number;
  lng: number;
  address: string;
  photos: Blob[];
}

export class NotSignedInError extends Error {
  constructor() { super("Sign in to send a report."); }
}

/** Saves a report. Uses Supabase when configured, otherwise keeps it in this browser (demo mode). */
export async function submitReport(input: NewReportInput): Promise<{ id: string }> {
  if (!isSupabaseConfigured()) {
    const report: Report = {
      id: `demo-${Date.now().toString(36)}`,
      title: input.title, body: input.body, category: input.category, status: "submitted",
      lat: input.lat, lng: input.lng, address: input.address,
      photoUrls: await Promise.all(input.photos.map(blobToDataUrl)),
      author: DEMO_USER, createdAt: new Date().toISOString(), mine: true, likes: 0, comments: 0, shares: 0,
    };
    addDemoReport(report);
    return { id: report.id };
  }

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new NotSignedInError();

  const photoUrls: string[] = [];
  for (const blob of input.photos) {
    const path = `${auth.user.id}/${crypto.randomUUID()}.jpg`; // first folder = user id, as the storage policy requires
    const { error } = await supabase.storage.from("report-photos").upload(path, blob, { contentType: "image/jpeg" });
    if (error) throw new Error("A photo couldn't be uploaded. Please try again.");
    photoUrls.push(supabase.storage.from("report-photos").getPublicUrl(path).data.publicUrl);
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      author_id: auth.user.id, title: input.title, body: input.body, category: input.category,
      lat: input.lat, lng: input.lng, address: input.address, photo_urls: photoUrls,
    })
    .select("id")
    .single();
  if (error) throw new Error("Your report couldn't be saved. Please try again.");
  return { id: data.id };
}

/** Deletes one of the signed-in citizen's own reports (row-level security enforces ownership). */
export async function deleteReport(report: Report): Promise<void> {
  if (!isSupabaseConfigured()) {
    deleteDemoReport(report.id);
    return;
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("reports").delete().eq("id", report.id).select("id");
  if (error || !data?.length) throw new Error("This report couldn't be deleted. Please try again.");

  // Best-effort cleanup of the photos; a failure here must not undo the delete.
  const paths = (report.photoUrls ?? []).map((u) => u.split("/report-photos/")[1]).filter(Boolean);
  if (paths.length) await supabase.storage.from("report-photos").remove(paths);
}
