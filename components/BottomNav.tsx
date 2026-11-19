"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, Plus, Settings, User } from "lucide-react";

// Five equal tabs, so "Add" sits exactly in the middle and everything lines up on one baseline.
const NAV = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/reports", label: "Reports", Icon: ListChecks },
  { href: "/reports/new", label: "Add", Icon: Plus, primary: true },
  { href: "/profile", label: "Profile", Icon: User },
  { href: "/settings", label: "Settings", Icon: Settings },
];

const isActive = (path: string, href: string) => {
  if (href === "/") return path === "/";
  if (href === "/reports") return path.startsWith("/reports") && path !== "/reports/new";
  return path === href || path.startsWith(href + "/");
};

export function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-[1000] border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {NAV.map(({ href, label, Icon, primary }) => {
          const on = isActive(path, href);
          return (
            <Link
              key={href} href={href}
              aria-current={on ? "page" : undefined}
              aria-label={primary ? "Add a report" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${primary || on ? "text-brand-deep" : "text-muted"} ${primary ? "font-semibold" : ""}`}
            >
              {/* every icon sits in the same fixed-height slot, so all the labels line up */}
              <span className="grid h-9 place-items-center">
                {primary ? (
                  <span className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-[0_6px_14px_-6px_rgb(27_133_0/0.8)]"><Icon size={20} aria-hidden /></span>
                ) : <Icon size={22} aria-hidden strokeWidth={on ? 2.4 : 2} />}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
