"use client";
import dynamic from "next/dynamic";

const GovMap = dynamic(() => import("./GovMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-200" aria-label="Loading map" />,
});
export default GovMap;
