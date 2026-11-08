"use client";
import Link from "next/link";
import { Heart, MapPin, MessageCircle } from "lucide-react";
import type { Report } from "@/lib/types";
import { categoryById, STATUS, STATUS_STEPS } from "@/lib/categories";
import { compact } from "@/lib/format";
import { formatDistance } from "@/lib/geo";
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
      className={`block rounded-3xl bg-surface p-4 shadow-card ring-1 transition-all ${
        active ? "shadow-float ring-2 ring-brand" : "ring-black/[0.05] hover:-translate-y-px hover:shadow-float"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-2xl"
          style={{ background: `color-mix(in srgb, ${cat.color} 14%, white)`, color: cat.color }}
          aria-hidden
        >
          <cat.Icon size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</p>
          <h3 className="mt-0.5 line-clamp-2 font-display text-[17px] font-semibold leading-snug tracking-tight">{report.title}</h3>
        </div>
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
        ) : (
          <StatusBadge status={report.status} />
        )}
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-muted">
        <MapPin size={13} aria-hidden className="shrink-0" /> <span className="truncate">{report.address}</span>
        {report.distanceKm !== undefined && <span className="shrink-0 font-semibold text-brand-deep">· {formatDistance(report.distanceKm)}</span>}
      </p>

      {showProgress && (
        <div className="mt-3">
          <div className="flex gap-1" role="img" aria-label={`Step ${step + 1} of ${STATUS_STEPS.length}: ${STATUS[report.status].label}`}>
            {STATUS_STEPS.map((s, i) => (
              <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-slate-200"}`} />
            ))}
          </div>
          <p className="mt-1.5 text-xs font-semibold text-brand-deep">Step {step + 1} of {STATUS_STEPS.length} · {STATUS[report.status].label}</p>
        </div>
      )}

      <p className="mt-3 flex items-center gap-4 border-t border-line pt-2.5 text-xs text-muted">
        {thumb && <StatusBadge status={report.status} />}
        <span className="inline-flex items-center gap-1"><Heart size={14} aria-hidden /> {compact(likes)}</span>
        <span className="inline-flex items-center gap-1"><MessageCircle size={14} aria-hidden /> {compact(comments)}</span>
        <span className="ml-auto"><TimeAgo iso={report.createdAt} /></span>
      </p>
    </Link>
  );
}
