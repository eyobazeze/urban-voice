"use client";
import { usePathname } from "next/navigation";
import type { Report } from "@/lib/types";
import { ReportsList } from "./ReportsList";
import { ReportsOverview } from "./ReportsOverview";

// Desktop: list on the left, selected report on the right.
// Mobile: the list and the report are separate screens.
export function ReportsShell({ reports, children }: { reports: Report[]; children: React.ReactNode }) {
  const path = usePathname();
  const segment = path.split("/")[2] ?? null;
  const isIndex = !segment;

  return (
    <div className="lg:grid lg:h-[calc(100dvh-4rem)] lg:grid-cols-[clamp(480px,42vw,640px)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
      <div className={`${isIndex ? "block" : "hidden"} lg:block lg:min-h-0 lg:border-r lg:border-line`}>
        <ReportsList reports={reports} activeId={segment} />
      </div>
      <div className={`${isIndex ? "hidden" : "block"} lg:block lg:min-h-0 lg:overflow-y-auto`}>{isIndex ? <ReportsOverview reports={reports} /> : children}</div>
    </div>
  );
}
