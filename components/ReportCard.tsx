"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart, MessageCircle, MapPin, ArrowRight } from "lucide-react";
import type { Report } from "@/lib/types";
import { categoryById } from "@/lib/categories";
import { compact, timeAgo } from "@/lib/format";
import { formatDistance } from "@/lib/geo";
import { useEngagement } from "@/lib/engagement";
import { StatusBadge } from "./ui/StatusBadge";
import { TimeAgo } from "./ui/TimeAgo";
import { QuickComment } from "./QuickComment";
import { ShareButton } from "./ShareButton";

const action = "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-muted transition-colors hover:bg-slate-100 hover:text-ink";

export function ReportCard({
  report, active, onSelect,
}: { report: Report; active?: boolean; onSelect?: (id: string) => void }) {
  const cat = categoryById(report.category);
  const { liked, likes, comments, toggleLike } = useEngagement(report);
  const [commenting, setCommenting] = useState(false);
  const photo = report.photoUrls?.[0];
  void timeAgo;

  return (
    <article
      data-report-id={report.id}
      onClick={() => onSelect?.(report.id)}
      className={`cursor-pointer rounded-3xl bg-surface p-4 shadow-card ring-1 transition-all sm:p-5 ${
        active ? "shadow-float ring-2 ring-brand" : "ring-black/[0.05] hover:-translate-y-px hover:shadow-float"
      }`}
    >
      <header className="flex items-start gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-2xl"
          style={{ background: `color-mix(in srgb, ${cat.color} 14%, white)`, color: cat.color }}
          aria-hidden
        >
          <cat.Icon size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</p>
          <p className="truncate text-xs text-muted">{report.author.name} · <TimeAgo iso={report.createdAt} /></p>
        </div>
        <StatusBadge status={report.status} />
      </header>

      <h3 className="mt-3.5 font-display text-[19px] font-semibold leading-snug tracking-tight">{report.title}</h3>
      {report.body && <p className="mt-1.5 line-clamp-3 text-[14.5px] leading-relaxed text-muted">{report.body}</p>}

      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="mt-3.5 aspect-[16/9] w-full rounded-2xl object-cover" />
      )}

      <p className="mt-3.5 flex items-center gap-1.5 text-[13px] text-muted">
        <MapPin size={14} aria-hidden className="shrink-0" />
        <span className="truncate">{report.address}</span>
        {report.distanceKm !== undefined && <span className="shrink-0 font-semibold text-brand-deep">· {formatDistance(report.distanceKm)} away</span>}
      </p>

      <footer className="mt-3 flex items-center gap-1 border-t border-line pt-2.5">
        <button
          onClick={(e) => { e.stopPropagation(); void toggleLike(); }}
          aria-pressed={liked}
          aria-label={`Like, ${likes} likes`}
          className={`${action} ${liked ? "!text-rose-600" : ""}`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} aria-hidden /> {compact(likes)}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setCommenting((v) => !v); }}
          aria-expanded={commenting}
          aria-label={`Comment, ${comments} comments`}
          className={`${action} ${commenting ? "!text-brand-deep" : ""}`}
        >
          <MessageCircle size={18} aria-hidden /> {compact(comments)}
        </button>
        <ShareButton report={report} count={report.shares} className={action} />
        {active && (
          <Link href={`/reports/${report.id}`} onClick={(e) => e.stopPropagation()} className="ml-auto inline-flex h-9 items-center gap-1 rounded-full bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep">
            View report <ArrowRight size={15} aria-hidden />
          </Link>
        )}
      </footer>
      {commenting && <QuickComment report={report} onClose={() => setCommenting(false)} />}
    </article>
  );
}
