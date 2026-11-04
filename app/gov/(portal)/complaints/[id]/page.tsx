import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ComplaintDetail, DemoComplaintDetail } from "@/components/gov/ComplaintDetail";
import { serverNow } from "@/lib/clock";
import { getComments, getHistory, getReport } from "@/lib/data";
import { getStaffAccess } from "@/lib/gov";

export default function ComplaintPage({ params }: PageProps<"/gov/complaints/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy />}>
      <Data params={params} />
    </Suspense>
  );
}

async function Data({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const access = await getStaffAccess();
  if (access.status !== "ok") return null;
  if (id.startsWith("demo-")) return <DemoComplaintDetail id={id} staff={access.staff} now={serverNow()} />;
  const report = await getReport(id);
  if (!report) notFound();
  const [comments, history] = await Promise.all([getComments(id), getHistory(id)]);
  return <ComplaintDetail report={report} comments={comments} history={history} staff={access.staff} now={serverNow()} />;
}
