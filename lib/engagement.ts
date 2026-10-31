"use client";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  addDemoComment, deleteDemoComment, toggleDemoLike,
  useDemoComments, useDemoLikes, useDemoProfile,
} from "./demo-store";
import { DEMO_USER } from "./mock-data";
import { createClient, isSupabaseConfigured } from "./supabase/client";
import type { Comment, Report } from "./types";

/*
 * Likes and comments.
 *  - Demo mode: kept in this browser.
 *  - Supabase mode: saved to the `likes` and `comments` tables. Until the page is reloaded, this
 *    browser remembers what you just did, so every card shows the same numbers straight away.
 *    Each note is only trusted while the server numbers it was based on are unchanged.
 */

interface Overlay {
  liked?: { value: boolean; serverLiked: boolean; serverLikes: number };
  comments?: { delta: number; serverComments: number };
}
const EMPTY: Record<string, Overlay> = {};
let overlays = EMPTY;
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const snapshot = () => overlays;
const publish = (id: string, next: Overlay) => {
  overlays = { ...overlays, [id]: next };
  listeners.forEach((l) => l());
};

const validDelta = (o: Overlay | undefined, r: Report) =>
  o?.comments && o.comments.serverComments === r.comments ? o.comments.delta : 0;

function setLiked(r: Report, value: boolean) {
  publish(r.id, { ...overlays[r.id], liked: { value, serverLiked: !!r.likedByMe, serverLikes: r.likes } });
}
function bumpComments(r: Report, by: number) {
  publish(r.id, { ...overlays[r.id], comments: { delta: validDelta(overlays[r.id], r) + by, serverComments: r.comments } });
}

function loginUrl() {
  return `/login?next=${encodeURIComponent(location.pathname + location.search)}`;
}

export function useEngagement(report: Report) {
  const router = useRouter();
  const demo = !isSupabaseConfigured();
  const demoLikes = useDemoLikes();
  const demoComments = useDemoComments(report.id);
  const ov = useSyncExternalStore(subscribe, snapshot, () => EMPTY)[report.id];

  let liked: boolean;
  let likes: number;
  let comments: number;
  if (demo) {
    liked = demoLikes.includes(report.id);
    likes = report.likes + (liked ? 1 : 0);
    comments = report.comments + demoComments.length;
  } else {
    const fresh = ov?.liked && ov.liked.serverLiked === !!report.likedByMe && ov.liked.serverLikes === report.likes;
    liked = fresh ? ov!.liked!.value : !!report.likedByMe;
    likes = report.likes + (liked ? 1 : 0) - (report.likedByMe ? 1 : 0);
    comments = report.comments + validDelta(ov, report);
  }

  const toggleLike = async () => {
    if (demo) { toggleDemoLike(report.id); return; }
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push(loginUrl()); return; }
    const next = !liked;
    setLiked(report, next); // show it straight away, undo if the save fails
    const { error } = next
      ? await supabase.from("likes").insert({ report_id: report.id, user_id: session.user.id })
      : await supabase.from("likes").delete().eq("report_id", report.id).eq("user_id", session.user.id);
    if (error && error.code !== "23505") setLiked(report, !next); // 23505 = already liked, which is fine
  };

  return { liked, likes, comments, toggleLike };
}

export function useComments(report: Report, initial: Comment[]) {
  const router = useRouter();
  const demo = !isSupabaseConfigured();
  const demoOwn = useDemoComments(report.id);
  const demoProfile = useDemoProfile();
  const [remote, setRemote] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const comments = demo ? [...initial, ...demoOwn] : remote;

  const post = async (text: string): Promise<boolean> => {
    setError(null);
    if (demo) {
      addDemoComment(report.id, {
        id: `demo-c-${Date.now().toString(36)}`,
        author: { name: demoProfile.name ?? DEMO_USER.name, handle: demoProfile.handle ?? DEMO_USER.handle },
        body: text, createdAt: new Date().toISOString(), mine: true,
      });
      return true;
    }
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push(loginUrl()); return false; }
    setBusy(true);
    const { data, error: err } = await supabase
      .from("comments")
      .insert({ report_id: report.id, author_id: session.user.id, body: text })
      .select("id, created_at")
      .single();
    setBusy(false);
    if (err || !data) { setError("Your comment couldn't be posted. Please try again."); return false; }
    const name = String(session.user.user_metadata?.full_name ?? "") || "You";
    setRemote((c) => [...c, { id: data.id, author: { name, handle: "" }, body: text, createdAt: data.created_at, mine: true }]);
    bumpComments(report, +1);
    return true;
  };

  const remove = async (id: string) => {
    setError(null);
    if (demo) { deleteDemoComment(report.id, id); return; }
    const { data, error: err } = await createClient().from("comments").delete().eq("id", id).select("id");
    if (err || !data?.length) { setError("That comment couldn't be deleted. Please try again."); return; }
    setRemote((c) => c.filter((x) => x.id !== id));
    bumpComments(report, -1);
  };

  return { comments, post, remove, busy, error };
}
