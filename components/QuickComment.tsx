"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Report } from "@/lib/types";
import { useComments } from "@/lib/engagement";

// A small comment box that opens inside a feed card, so people can reply without leaving the map.
export function QuickComment({ report, onClose }: { report: Report; onClose: () => void }) {
  const thread = useComments(report, []);
  const [text, setText] = useState("");
  const [posted, setPosted] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    if (await thread.post(body)) { setText(""); setPosted(true); }
  };

  if (posted) {
    return (
      <div onClick={(e) => e.stopPropagation()} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-brand-tint/70 px-3.5 py-2.5 text-sm text-brand-deep">
        <span className="font-medium">Comment posted.</span>
        <Link href={`/reports/${report.id}`} className="font-semibold hover:underline">View discussion</Link>
        <button type="button" onClick={() => setPosted(false)} className="hover:underline">Add another</button>
        <button type="button" onClick={onClose} className="ml-auto hover:underline">Close</button>
      </div>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
      <form onSubmit={submit} className="mt-3 flex items-center gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Add a comment on “{report.title}”</span>
          <input ref={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment" maxLength={1000}
            className="h-10 w-full rounded-full border border-line bg-surface px-4 text-sm placeholder:text-muted focus:border-brand focus:outline-none" />
        </label>
        <button type="submit" disabled={!text.trim() || thread.busy}
          className="h-10 rounded-full bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-40">
          {thread.busy ? "Posting…" : "Post"}
        </button>
        <button type="button" onClick={onClose} aria-label="Close comment box" className="grid size-9 place-items-center rounded-full text-muted hover:bg-slate-100">
          <X size={16} aria-hidden />
        </button>
      </form>
      {thread.error && <p role="alert" className="mt-1.5 text-sm text-rose-600">{thread.error}</p>}
    </div>
  );
}
