"use client";
import Link from "next/link";
import { Heart, MessageCircle, Share2, MapPin, ArrowRight } from "lucide-react";
import type { Report } from "@/lib/types";
import { categoryById } from "@/lib/categories";
import { compact } from "@/lib/format";
import { Avatar } from "./ui/Avatar";
import { useEngagement } from "@/lib/engagement";
import { StatusBadge } from "./ui/StatusBadge";
import { TimeAgo } from "./ui/TimeAgo";

export function ReportCard({
  report, active, onSelect,
}: { report: Report; active?: boolean; onSelect?: (id: string) => void }) {
  const cat = categoryById(report.category);
  const { liked, likes, comments, toggleLike } = useEngagement(report);

  return (
    <article
      data-report-id={report.id}
      onClick={() => onSelect?.(report.id)}
      className={`cursor-pointer rounded-2xl border bg-surface p-4 shadow-card transition-colors ${
        active ? "border-brand ring-2 ring-brand/15" : "border-line hover:border-slate-300"
      }`}
    >
      <header className="flex items-center gap-3">
        <Avatar name={report.author.name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{report.author.name}</p>
          <p className="text-xs text-muted"><TimeAgo iso={report.createdAt} /></p>
        </div>
        <StatusBadge status={report.status} />
      </header>

      <h3 className="mt-3 font-display text-[17px] font-semibold leading-snug">{report.title}</h3>
      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{report.body}</p>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-white" style={{ background: cat.color }}>
          <cat.Icon size={13} aria-hidden /> {cat.label}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1 text-muted">
          <MapPin size={13} aria-hidden className="shrink-0" /> <span className="truncate">{report.address}</span>
        </span>
      </div>

      <footer className="mt-3 flex items-center gap-5 border-t border-line pt-3 text-sm text-muted">
        <button
          onClick={(e) => { e.stopPropagation(); void toggleLike(); }}
          aria-pressed={liked}
          aria-label={`Like, ${likes} likes`}
          className={`inline-flex items-center gap-1.5 ${liked ? "font-medium text-rose-600" : "hover:text-ink"}`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} aria-hidden /> {compact(likes)}
        </button>
        <span className="inline-flex items-center gap-1.5"><MessageCircle size={18} aria-hidden /> {compact(comments)}</span>
        <span className="inline-flex items-center gap-1.5"><Share2 size={18} aria-hidden /> {compact(report.shares)}</span>
        {active && (
          <Link href={`/reports/${report.id}`} onClick={(e) => e.stopPropagation()} className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-deep hover:underline">
            View report <ArrowRight size={15} aria-hidden />
          </Link>
        )}
      </footer>
    </article>
  );
}
