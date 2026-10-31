import Link from "next/link";
import { X, MapPin, ArrowRight } from "lucide-react";
import type { Report } from "@/lib/types";
import { categoryById } from "@/lib/categories";
import { StatusBadge } from "./ui/StatusBadge";

export function MapPreviewCard({ report, onClose }: { report: Report; onClose: () => void }) {
  const cat = categoryById(report.category);
  return (
    <div
      role="dialog" aria-label="Report preview"
      className="absolute bottom-6 left-1/2 z-[550] hidden w-[380px] -translate-x-1/2 rounded-2xl border border-line bg-surface p-4 shadow-float lg:block"
    >
      <button onClick={onClose} aria-label="Close preview" className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full text-muted hover:bg-slate-100">
        <X size={17} aria-hidden />
      </button>
      <div className="flex items-center gap-2 pr-8 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-white" style={{ background: cat.color }}>
          <cat.Icon size={13} aria-hidden /> {cat.label}
        </span>
        <StatusBadge status={report.status} />
      </div>
      <h3 className="mt-2.5 pr-6 font-display text-[17px] font-semibold leading-snug">{report.title}</h3>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin size={13} aria-hidden /> {report.address}</p>
      <Link href={`/reports/${report.id}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep hover:underline">
        View report <ArrowRight size={15} aria-hidden />
      </Link>
    </div>
  );
}
