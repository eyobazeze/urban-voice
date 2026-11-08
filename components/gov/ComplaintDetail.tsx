"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Loader2, MapPin, UserCheck } from "lucide-react";
import type { Comment, HistoryEntry, Report, ReportStatus } from "@/lib/types";
import type { Staff } from "@/lib/gov-types";
import { categoryById, STATUS, STATUS_STEPS } from "@/lib/categories";
import { applyDemoStatus, useDemoStatus, useHydrated, useMergedReports } from "@/lib/demo-store";
import { areaOf, priorityOf } from "@/lib/analytics";
import { assignReport, setStatus } from "@/lib/gov-api";
import { Avatar } from "../ui/Avatar";
import { StatusBadge } from "../ui/StatusBadge";
import { TimeAgo } from "../ui/TimeAgo";
import MiniMap from "../MiniMapLoader";
import { Panel, PriorityPill, shortDate } from "./bits";

const TONE: Record<ReportStatus, string> = { submitted: "#64748b", in_review: "#d97706", in_progress: "#0284c7", resolved: "#1b8500" };

export function ComplaintDetail({ report: base, comments, history: serverHistory, staff, now }: {
  report: Report; comments: Comment[]; history: HistoryEntry[]; staff: Staff; now: number;
}) {
  const router = useRouter();
  const overlay = useDemoStatus()[base.id];
  const report = useMemo(() => applyDemoStatus(base, overlay), [base, overlay]);
  const history = useMemo(() => [...serverHistory, ...(overlay?.history ?? [])], [serverHistory, overlay]);
  const [picked, setPicked] = useState<ReportStatus | null>(null);
  const target = picked ?? report.status;
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const cat = categoryById(report.category);
  const takenByMe = report.assigneeId === staff.id;
  const photos = report.photoUrls ?? [];
  const unchanged = target === report.status && !note.trim();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await setStatus(report, target, note, staff);
      setNote("");
      setPicked(null);
      setMsg({ ok: true, text: target === report.status ? "Note added." : `Marked as ${STATUS[target].label.toLowerCase()}. The citizen can see this on their tracker.` });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "The update couldn't be saved." });
    } finally {
      setBusy(false);
    }
  };

  const assign = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await assignReport(report, staff, !takenByMe);
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "The assignment couldn't be saved." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Link href="/gov/complaints" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> All complaints
      </Link>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="h-1.5" style={{ background: cat.color }} />
            <div className="p-5 lg:p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold" style={{ background: `color-mix(in srgb, ${cat.color} 13%, white)`, color: cat.color }}>
                  <cat.Icon size={14} aria-hidden /> {cat.label}
                </span>
                <StatusBadge status={report.status} />
                <PriorityPill priority={priorityOf(report, now)} />
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold leading-tight lg:text-3xl">{report.title}</h1>
              <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted">Reported by</dt><dd className="mt-0.5 flex items-center gap-2 font-medium"><Avatar name={report.author.name} size={24} /> {report.author.name}</dd></div>
                <div><dt className="text-muted">Submitted</dt><dd className="mt-0.5 font-medium">{shortDate(report.createdAt)} · <TimeAgo iso={report.createdAt} /></dd></div>
                <div><dt className="text-muted">District</dt><dd className="mt-0.5 font-medium">{areaOf(report)}</dd></div>
                <div><dt className="text-muted">Community support</dt><dd className="mt-0.5 font-medium">{report.likes} supporters · {report.comments} comments</dd></div>
                <div><dt className="text-muted">Assigned to</dt><dd className="mt-0.5 font-medium">{report.assignee ?? "Nobody yet"}</dd></div>
                <div><dt className="text-muted">Reference</dt><dd className="mt-0.5 font-mono text-xs font-medium">{report.id.slice(0, 8).toUpperCase()}</dd></div>
              </dl>
            </div>
          </section>

          <Panel title="What was reported">
            {report.body ? <p className="text-[15px] leading-relaxed">{report.body}</p> : <p className="text-sm text-muted">The citizen didn&rsquo;t add a description.</p>}
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt={`Photo ${i + 1} from the citizen`} className="aspect-[4/3] w-full rounded-2xl object-cover" />
                ))}
              </div>
            )}
            <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted"><MapPin size={15} aria-hidden /> {report.address}</p>
            <div className="relative isolate mt-3 h-56 overflow-hidden rounded-2xl border border-line">
              <MiniMap lat={report.lat} lng={report.lng} color={cat.color} />
            </div>
          </Panel>

          <Panel title="Citizen discussion" subtitle="Read only. This is what neighbours are saying publicly.">
            {comments.length === 0 ? <p className="text-sm text-muted">No comments yet.</p> : (
              <ul className="space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <Avatar name={c.author.name} size={32} />
                    <div className="min-w-0 flex-1 rounded-2xl bg-gov-canvas px-3.5 py-2.5">
                      <p className="text-sm"><span className="font-semibold">{c.author.name}</span> <span className="text-xs text-muted"><TimeAgo iso={c.createdAt} /></span></p>
                      <p className="mt-0.5 text-sm leading-relaxed">{c.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Panel title="Update this complaint" subtitle="Citizens see the new status and your note straight away.">
            <form onSubmit={save} className="space-y-4">
              <fieldset>
                <legend className="sr-only">New status</legend>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_STEPS.map((s) => (
                    <label key={s} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                      target === s ? "border-brand bg-brand-tint text-brand-deep" : "border-line hover:bg-slate-50"
                    }`}>
                      <input type="radio" name="status" value={s} checked={target === s} onChange={() => setPicked(s)} className="sr-only" />
                      <span aria-hidden className="size-2.5 rounded-full" style={{ background: TONE[s] }} />
                      {STATUS[s].label}
                      {report.status === s && <span className="ml-auto text-[10px] font-semibold uppercase text-muted">Now</span>}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="note" className="text-sm font-semibold">Note for the citizen <span className="font-normal text-muted">(optional)</span></label>
                <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500}
                  placeholder="For example: A crew has been scheduled for Thursday."
                  className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed placeholder:text-muted focus:border-brand focus:outline-none" />
              </div>
              <button type="submit" disabled={busy || unchanged}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50">
                {busy && <Loader2 size={16} className="animate-spin" aria-hidden />} Save update
              </button>
              {msg && <p role="status" className={`text-sm ${msg.ok ? "text-brand-deep" : "text-rose-600"}`}>{msg.text}</p>}
            </form>
            <div className="mt-5 border-t border-line pt-4">
              <button onClick={assign} disabled={busy}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
                <UserCheck size={16} aria-hidden /> {takenByMe ? "Unassign me" : report.assignee ? `Take over from ${report.assignee.split(" ")[0]}` : "Assign to me"}
              </button>
            </div>
          </Panel>

          <Panel title="History">
            <ol className="space-y-4">
              {[...history].reverse().map((h) => (
                <li key={h.id} className="flex gap-3">
                  <span aria-hidden className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: TONE[h.status] }} />
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{h.note && h.status === report.status && !h.by ? "Note" : `Marked ${STATUS[h.status].label.toLowerCase()}`}{h.by ? <span className="font-normal text-muted"> by {h.by}</span> : null}</p>
                    {h.note && <p className="mt-0.5 leading-relaxed text-muted">“{h.note}”</p>}
                    <p className="mt-0.5 text-xs text-muted"><TimeAgo iso={h.createdAt} /></p>
                  </div>
                </li>
              ))}
              <li className="flex gap-3">
                <span aria-hidden className="mt-1.5 size-2.5 shrink-0 rounded-full bg-slate-300" />
                <div className="text-sm"><p className="font-medium">Reported by {report.author.name}</p><p className="mt-0.5 text-xs text-muted"><TimeAgo iso={report.createdAt} /></p></div>
              </li>
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// Reports filed in demo mode live in this browser, so they are looked up here rather than on the server.
export function DemoComplaintDetail({ id, staff, now }: { id: string; staff: Staff; now: number }) {
  const found = useMergedReports([]).find((r) => r.id === id);
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy />;
  if (!found) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Complaint not found</h1>
        <p className="mt-2 text-muted">Demo complaints are only stored in the browser that created them.</p>
        <Link href="/gov/complaints" className="mt-4 inline-block font-semibold text-brand-deep hover:underline">Back to complaints</Link>
      </div>
    );
  }
  return <ComplaintDetail report={found} comments={[]} history={[]} staff={staff} now={now} />;
}
