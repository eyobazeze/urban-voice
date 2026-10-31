"use client";
import Link from "next/link";
import { Heart, MapPin, MessageCircle } from "lucide-react";
import type { Report } from "@/lib/types";
import { categoryById, STATUS, STATUS_STEPS } from "@/lib/categories";
import { compact } from "@/lib/format";
import { useEngagement } from "@/lib/engagement";
import { StatusBadge } from "./ui/StatusBadge";
import { TimeAgo } from "./ui/TimeAgo";

export function ReportListItem({ report, active, showProgress = false }: { report: Report; active: boolean; showProgress?: boolean }) {
  const cat = categoryById(report.category);
  const step = STATUS_STEPS.indexOf(report.status);
  const thumb = report.photoUrls?.[0];
  const { likes, comments } = useEngagement(report);
  return (
    <Link
      href={`/reports/${report.id}`}
      data-report-id={report.id}
      aria-current={active ? "page" : undefined}
      className={`group relative block overflow-hidden rounded-2xl border bg-surface py-4 pl-5 pr-4 transition-all ${
        active ? "border-brand shadow-float ring-2 ring-brand/15" : "border-line shadow-card hover:-translate-y-px hover:shadow-float"
      }`}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: cat.color }} />

      <div className="flex items-center justify-between gap-3 text-xs">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold"
          style={{ background: `color-mix(in srgb, ${cat.color} 13%, white)`, color: cat.color }}
        >
          <cat.Icon size={13} aria-hidden /> {cat.label}
        </span>
        <StatusBadge status={report.status} />
      </div>

      <div className="mt-2.5 flex gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-display text-[17px] font-semibold leading-snug">{report.title}</h3>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
            <MapPin size={13} aria-hidden className="shrink-0" /> <span className="truncate">{report.address}</span>
          </p>
        </div>
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
        )}
      </div>

      {showProgress && (
        <div className="mt-3.5">
          <div className="flex gap-1" role="img" aria-label={`Step ${step + 1} of ${STATUS_STEPS.length}: ${STATUS[report.status].label}`}>
            {STATUS_STEPS.map((s, i) => (
              <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-slate-200"}`} />
            ))}
          </div>
          <p className="mt-1.5 text-xs font-medium text-brand-deep">Step {step + 1} of {STATUS_STEPS.length} · {STATUS[report.status].label}</p>
        </div>
      )}

      <p className="mt-3 flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1"><Heart size={14} aria-hidden /> {compact(likes)}</span>
        <span className="inline-flex items-center gap-1"><MessageCircle size={14} aria-hidden /> {compact(comments)}</span>
        <span className="ml-auto"><TimeAgo iso={report.createdAt} /></span>
      </p>
    </Link>
  );
}
