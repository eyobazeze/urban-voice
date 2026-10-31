import type { Metadata } from "next";
import { AddReportForm } from "@/components/AddReportForm";

export const metadata: Metadata = { title: "Add a report" };

export default function NewReportPage() {
  return <AddReportForm />;
}
