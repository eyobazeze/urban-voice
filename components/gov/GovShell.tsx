"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BarChart3, ChevronDown, ExternalLink, FileText, LayoutDashboard, LogOut, MapPinned, Settings, Map as MapIcon } from "lucide-react";
import type { Staff } from "@/lib/gov-types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Avatar } from "../ui/Avatar";

const NAV = [
  { href: "/gov", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/gov/complaints", label: "Complaints", Icon: FileText },
  { href: "/gov/map", label: "Map operations", Icon: MapIcon },
  { href: "/gov/performance", label: "Performance", Icon: BarChart3 },
  { href: "/gov/settings", label: "Settings", Icon: Settings },
];

export function GovShell({ staff, children }: { staff: Staff; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const active = (href: string, exact?: boolean) => (exact ? path === href : path === href || path.startsWith(href + "/"));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!menu.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const signOut = async () => {
    setOpen(false);
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    router.push("/gov/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-gov-canvas lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      {/* Sidebar (desktop) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-b from-brand-deep via-brand-deep to-[#0f4d00] text-white lg:block">
        <div aria-hidden className="absolute -bottom-24 -left-20 size-80 rounded-full bg-white/5" />
        <div aria-hidden className="absolute -right-16 bottom-40 size-52 rounded-full bg-white/5" />
        <div className="sticky top-0 flex h-dvh flex-col p-5">
          <Link href="/gov" className="flex items-center gap-2.5 font-display text-xl font-bold">
            <span className="grid size-9 place-items-center rounded-xl bg-white text-brand-deep"><MapPinned size={19} aria-hidden /></span>
            UrbanVoice
          </Link>
          <p className="mt-1 pl-[46px] text-xs font-medium uppercase tracking-wider text-white/60">Staff portal</p>
          <nav aria-label="Staff" className="mt-8 flex flex-col gap-1">
            {NAV.map(({ href, label, Icon, exact }) => (
              <Link key={href} href={href} aria-current={active(href, exact) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition-colors ${
                  active(href, exact) ? "bg-white/18 text-white" : "text-white/80 hover:bg-white/10"
                }`}>
                <Icon size={19} aria-hidden /> {label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-auto flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
            <ExternalLink size={16} aria-hidden /> Citizen site
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-[1100] flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur lg:px-8">
          <Link href="/gov" className="flex items-center gap-2 font-display text-lg font-bold lg:hidden">
            <span className="grid size-8 place-items-center rounded-lg bg-brand text-white"><MapPinned size={17} aria-hidden /></span>
            Staff
          </Link>
          <div ref={menu} className="relative ml-auto">
            <button onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}
              className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-slate-100">
              <Avatar name={staff.name} size={36} />
              <span className="hidden text-left text-sm leading-tight sm:block">
                <span className="block font-semibold">{staff.name}</span>
                <span className="block text-xs text-muted">{staff.title}</span>
              </span>
              <ChevronDown size={15} aria-hidden className="text-muted" />
            </button>
            {open && (
              <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-float">
                {staff.demo && <p className="px-3 py-2 text-xs text-muted">Demo mode: sample staff account</p>}
                <Link role="menuitem" href="/gov/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-100"><Settings size={16} aria-hidden /> Settings</Link>
                <Link role="menuitem" href="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-100"><ExternalLink size={16} aria-hidden /> Citizen site</Link>
                <button role="menuitem" onClick={signOut} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-100"><LogOut size={16} aria-hidden /> Sign out</button>
              </div>
            )}
          </div>
        </header>

        {/* Section tabs (phones and tablets) */}
        <nav aria-label="Staff" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line bg-surface px-3 py-2 lg:hidden">
          {NAV.map(({ href, label, Icon, exact }) => (
            <Link key={href} href={href} aria-current={active(href, exact) ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium ${
                active(href, exact) ? "bg-brand-tint text-brand-deep" : "text-ink hover:bg-slate-100"
              }`}>
              <Icon size={16} aria-hidden /> {label}
            </Link>
          ))}
        </nav>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
