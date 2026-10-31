import { Construction, Lightbulb, Trash2, Bus, Trees, ShieldAlert, type LucideIcon } from "lucide-react";
import type { CategoryId, ReportStatus } from "./types";

export const CATEGORIES: { id: CategoryId; label: string; color: string; Icon: LucideIcon }[] = [
  { id: "roads", label: "Roads", color: "var(--color-cat-roads)", Icon: Construction },
  { id: "lighting", label: "Lighting", color: "var(--color-cat-lighting)", Icon: Lightbulb },
  { id: "waste", label: "Waste", color: "var(--color-cat-waste)", Icon: Trash2 },
  { id: "transport", label: "Transport", color: "var(--color-cat-transport)", Icon: Bus },
  { id: "parks", label: "Parks", color: "var(--color-cat-parks)", Icon: Trees },
  { id: "safety", label: "Safety", color: "var(--color-cat-safety)", Icon: ShieldAlert },
];

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export const STATUS: Record<ReportStatus, { label: string; tone: string }> = {
  submitted: { label: "Submitted", tone: "bg-slate-100 text-slate-700" },
  in_review: { label: "In review", tone: "bg-amber-100 text-amber-800" },
  in_progress: { label: "In progress", tone: "bg-sky-100 text-sky-800" },
  resolved: { label: "Resolved", tone: "bg-brand-tint text-brand-deep" },
};

export const STATUS_STEPS: ReportStatus[] = ["submitted", "in_review", "in_progress", "resolved"];
