import { STATUS } from "@/lib/categories";
import type { ReportStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ReportStatus }) {
  const s = STATUS[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.tone}`}>{s.label}</span>;
}
