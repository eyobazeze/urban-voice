"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Heart, Map as MapIcon, MapPin, MessageCircle, Share2, Trash2 } from "lucide-react";
import type { Comment, Report, ReportStatus } from "@/lib/types";
import { categoryById, STATUS, STATUS_STEPS } from "@/lib/categories";
import { compact } from "@/lib/format";
import { deleteReport } from "@/lib/reports-api";
import { useComments, useEngagement } from "@/lib/engagement";
import { useDemoProfile, useHiddenIds } from "@/lib/demo-store";
import { Avatar } from "./ui/Avatar";
import { StatusBadge } from "./ui/StatusBadge";
import { TimeAgo } from "./ui/TimeAgo";
import { ConfirmDialog } from "./ConfirmDialog";
import MiniMap from "./MiniMapLoader";

const NOTE: Record<ReportStatus, { mine: string; other: string }> = {
  submitted: { mine: "We've received your report. It is waiting to be reviewed.", other: "Waiting for the city to review it." },
  in_review: { mine: "The city is reviewing your report.", other: "The city is reviewing this report." },
  in_progress: { mine: "Work on this issue is under way.", other: "Work on this issue is under way." },
  resolved: { mine: "This issue has been resolved. Thank you for reporting it.", other: "This issue has been resolved." },
};

const pill = "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors";

export function ReportDetail({ report, initialComments }: { report: Report; initialComments: Comment[] }) {
  const router = useRouter();
  const cat = categoryById(report.category);
  const deleted = useHiddenIds().includes(report.id);
  const demoProfile = useDemoProfile();
  const authorName = report.mine && demoProfile.name ? demoProfile.name : report.author.name; // renamed in demo settings
  const { liked, likes, comments: commentCount, toggleLike } = useEngagement(report);
  const thread = useComments(report, initialComments);
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const current = STATUS_STEPS.indexOf(report.status);
  const photos = report.photoUrls ?? [];

  if (deleted && !deleting) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">This report was deleted</h1>
        <Link href="/reports" className="mt-4 inline-block font-semibold text-brand-deep hover:underline">Back to reports</Link>
      </div>
    );
  }

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (await thread.post(text)) setDraft("");
  };

  const doDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteReport(report);
      router.push("/reports");
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "This report couldn't be deleted. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <article className="mx-auto max-w-3xl space-y-4 p-4 lg:p-8">
      <div className="flex items-center gap-2">
        <Link href="/reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink lg:hidden">
          <ArrowLeft size={16} aria-hidden /> Reports
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link href={`/?report=${report.id}`} className={`${pill} border-line bg-surface hover:bg-slate-50`}>
            <MapIcon size={16} aria-hidden /> Show on map
          </Link>
          {report.mine && (
            <button onClick={() => { setDeleteError(null); setConfirming(true); }} className={`${pill} border-rose-200 bg-surface text-rose-700 hover:bg-rose-50`}>
              <Trash2 size={16} aria-hidden /> Delete
            </button>
          )}
        </div>
      </div>

      <header className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="h-1.5" style={{ background: cat.color }} />
        <div className="p-5 lg:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold" style={{ background: `color-mix(in srgb, ${cat.color} 13%, white)`, color: cat.color }}>
              <cat.Icon size={14} aria-hidden /> {cat.label}
            </span>
            <StatusBadge status={report.status} />
            {report.mine && <span className="rounded-full bg-brand-tint px-2.5 py-1 font-medium text-brand-deep">Your report</span>}
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold leading-tight lg:text-[32px]">{report.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={authorName} size={40} />
            <div className="text-sm">
              <p className="font-semibold">{authorName}</p>
              <p className="text-muted">Reported <TimeAgo iso={report.createdAt} /></p>
            </div>
          </div>
        </div>
      </header>

      <section aria-label="Progress" className="rounded-3xl border border-line bg-surface p-5 lg:p-6">
        <h2 className="text-sm font-semibold">{report.mine ? "Progress of your report" : "Progress"}</h2>
        <ol className="mt-4 grid grid-cols-4">
          {STATUS_STEPS.map((s, i) => {
            const done = i <= current;
            const line = i < STATUS_STEPS.length - 1
              ? `after:absolute after:left-1/2 after:top-3.5 after:h-0.5 after:w-full after:-translate-y-1/2 ${i < current ? "after:bg-brand" : "after:bg-slate-200"}`
              : "";
            return (
              <li key={s} aria-current={i === current ? "step" : undefined} className={`relative flex flex-col items-center gap-2 text-center text-xs ${line}`}>
                <span className={`relative z-10 grid size-7 place-items-center rounded-full ring-4 ring-surface ${done ? "bg-brand text-white" : "bg-slate-100 text-slate-400"}`}>
                  {done ? <Check size={15} aria-hidden /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                <span className={done ? "font-semibold text-ink" : "text-muted"}>{STATUS[s].label}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 rounded-xl bg-brand-tint/70 px-3.5 py-2.5 text-sm text-brand-deep">
          {report.mine ? NOTE[report.status].mine : NOTE[report.status].other}
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-line bg-surface p-5 lg:p-6" aria-label="Details">
        {report.body && <p className="text-[15px] leading-relaxed">{report.body}</p>}
        {photos.length > 0 && (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[0]} alt="Photo 1 of the issue" className="aspect-[16/10] w-full rounded-2xl object-cover" />
            {photos.length > 1 && (
              <div className="grid grid-cols-2 gap-2">
                {photos.slice(1).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt={`Photo ${i + 2} of the issue`} className="aspect-[4/3] w-full rounded-2xl object-cover" />
                ))}
              </div>
            )}
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold">Location</h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted"><MapPin size={15} aria-hidden /> {report.address}</p>
          <div className="relative isolate mt-3 h-44 overflow-hidden rounded-2xl border border-line">
            <MiniMap lat={report.lat} lng={report.lng} color={cat.color} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => void toggleLike()} aria-pressed={liked}
          className={`${pill} ${liked ? "border-rose-200 bg-rose-50 text-rose-700" : "border-line bg-surface hover:bg-slate-50"}`}>
          <Heart size={17} fill={liked ? "currentColor" : "none"} aria-hidden /> {compact(likes)}
        </button>
        <span className={`${pill} border-line bg-surface`}><MessageCircle size={17} aria-hidden /> {compact(commentCount)}</span>
        <span className={`${pill} border-line bg-surface`}><Share2 size={17} aria-hidden /> {compact(report.shares)}</span>
      </div>

      <section aria-label="Comments" className="rounded-3xl border border-line bg-surface p-5 lg:p-6">
        <h2 className="text-sm font-semibold">Discussion</h2>
        <ul className="mt-4 space-y-4">
          {thread.comments.length === 0 && <li className="text-sm text-muted">No comments yet. Add details others should know.</li>}
          {thread.comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar name={c.author.name} size={34} />
              <div className="min-w-0 flex-1 rounded-2xl bg-canvas px-3.5 py-2.5">
                <p className="flex items-center gap-1.5 text-sm">
                  <span className="font-semibold">{c.author.name}</span>
                  <span className="text-xs text-muted"><TimeAgo iso={c.createdAt} /></span>
                  {c.mine && (
                    <button type="button" onClick={() => void thread.remove(c.id)} aria-label="Delete your comment"
                      className="ml-auto grid size-7 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-700">
                      <Trash2 size={14} aria-hidden />
                    </button>
                  )}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={post} className="mt-4 flex gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Add a comment</span>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a comment" maxLength={1000}
              className="h-11 w-full rounded-full border border-line bg-surface px-4 text-[15px] placeholder:text-muted focus:border-brand focus:outline-none" />
          </label>
          <button type="submit" disabled={!draft.trim() || thread.busy} className="rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-40">
            {thread.busy ? "Posting…" : "Post"}
          </button>
        </form>
        {thread.error && <p role="alert" className="mt-2 text-sm text-rose-600">{thread.error}</p>}
      </section>

      <ConfirmDialog
        open={confirming} title="Delete this report?" confirmLabel="Delete report"
        busy={deleting} error={deleteError} onConfirm={doDelete} onCancel={() => setConfirming(false)}
      >
        <p>“{report.title}” will be removed for everyone{photos.length ? ", along with its photos" : ""}. This can&rsquo;t be undone.</p>
        {report.status !== "submitted" && (
          <p className="mt-2 font-medium text-rose-700">The city has already picked this report up. Deleting it removes the public record of that work.</p>
        )}
      </ConfirmDialog>
    </article>
  );
}
