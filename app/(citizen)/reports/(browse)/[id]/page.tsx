import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { DemoReport } from "@/components/DemoReport";
import { ReportDetail } from "@/components/ReportDetail";
import { getComments, getReport } from "@/lib/data";

export default function ReportPage({ params }: PageProps<"/reports/[id]">) {
  return (
    <Suspense fallback={<div className="m-8 h-96 animate-pulse rounded-2xl bg-slate-100" aria-busy />}>
      <ReportData params={params} />
    </Suspense>
  );
}

async function ReportData({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (id.startsWith("demo-")) return <DemoReport id={id} />;
  const report = await getReport(id);
  if (!report) notFound();
  const comments = await getComments(id);
  return <ReportDetail report={report} initialComments={comments} />;
}
