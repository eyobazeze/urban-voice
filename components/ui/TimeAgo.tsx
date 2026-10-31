"use client";
import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

// Renders a stable date on the server, then switches to "5m ago" in the browser.
export function TimeAgo({ iso }: { iso: string }) {
  const [text, setText] = useState(() =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
  );
  useEffect(() => {
    const update = () => setText(timeAgo(iso, Date.now()));
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [iso]);
  return <time dateTime={iso} suppressHydrationWarning>{text}</time>;
}
