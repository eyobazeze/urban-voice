"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Building2, ChevronDown, LogIn, LogOut, MapPinned, Plus, Settings, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/", label: "Home", active: (p: string) => p === "/" },
  { href: "/reports", label: "Reports", active: (p: string) => p.startsWith("/reports") && p !== "/reports/new" },
];

const item = "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-100";

export function TopBar() {
  const path = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const signOut = async () => {
    setOpen(false);
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-[1100] hidden h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-line bg-surface/95 px-6 backdrop-blur lg:grid">
      <Link href="/" className="flex items-center gap-2.5 justify-self-start font-display text-xl font-bold">
        <span className="grid size-9 place-items-center rounded-xl bg-brand text-white"><MapPinned size={19} aria-hidden /></span>
        UrbanVoice
      </Link>

      <nav aria-label="Main" className="flex gap-1">
        {LINKS.map(({ href, label, active }) => (
          <Link
            key={href} href={href}
            aria-current={active(path) ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
              active(path) ? "bg-brand-tint text-brand-deep" : "text-ink hover:bg-slate-100"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 justify-self-end">
        {auth.status === "out" && (
          <Link href="/login" className="rounded-full px-4 py-2 text-[15px] font-medium hover:bg-slate-100">Sign in</Link>
        )}
        <Link href="/reports/new" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-deep">
          <Plus size={18} aria-hidden /> Add report
        </Link>
        {auth.status !== "out" && (
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu" aria-expanded={open} aria-label="Account menu"
              className="flex items-center gap-1 rounded-full border border-line p-1 pr-2 hover:bg-slate-50"
            >
              <span className="grid size-8 place-items-center rounded-full bg-slate-200 text-slate-600"><User size={17} aria-hidden /></span>
              <ChevronDown size={15} aria-hidden className="text-muted" />
            </button>
            {open && (
              <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-float">
                <div className="border-b border-line px-3 pb-2.5 pt-2 text-sm">
                  {auth.status === "in" ? (
                    <>
                      <p className="truncate font-semibold">{auth.name || "Your account"}</p>
                      <p className="truncate text-xs text-muted">{auth.email}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">Demo mode</p>
                      <p className="text-xs text-muted">Browsing as the sample citizen</p>
                    </>
                  )}
                </div>
                <Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className={`${item} mt-1`}><User size={16} aria-hidden /> Profile</Link>
                <Link role="menuitem" href="/settings" onClick={() => setOpen(false)} className={item}><Settings size={16} aria-hidden /> Settings</Link>
                {auth.status === "in" ? (
                  <button role="menuitem" onClick={signOut} className={item}><LogOut size={16} aria-hidden /> Sign out</button>
                ) : (
                  <>
                    <Link role="menuitem" href="/login" onClick={() => setOpen(false)} className={item}><LogIn size={16} aria-hidden /> Sign in screens</Link>
                    <Link role="menuitem" href="/gov" onClick={() => setOpen(false)} className={item}><Building2 size={16} aria-hidden /> Staff portal (demo)</Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
