import type { Report } from "./types";

export interface AreaSummary { name: string; lat: number; lng: number; open: number; high: number; color: string }

export const STATUS_COLOR: Record<Report["status"], string> = {
  submitted: "#64748b", in_review: "#d97706", in_progress: "#0284c7", resolved: "#249a00",
};
