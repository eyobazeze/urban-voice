"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, Plus, User } from "lucide-react";

const NAV = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/reports", label: "Reports", Icon: ListChecks },
  { href: "/reports/new", label: "Add report", Icon: Plus, primary: true },
  { href: "/profile", label: "Profile", Icon: User },
];

const isActive = (path: string, href: string) => {
  if (href === "/") return path === "/";
  if (href === "/reports") return path.startsWith("/reports") && path !== "/reports/new";
  return path === href || path.startsWith(href + "/");
};

export function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-[1000] grid grid-cols-4 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {NAV.map(({ href, label, Icon, primary }) => (
        <Link
          key={href} href={href}
          aria-current={isActive(path, href) ? "page" : undefined}
          className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
            isActive(path, href) ? "text-brand-deep" : "text-muted"
          }`}
        >
          {primary ? (
            <span className="-mt-6 grid size-12 place-items-center rounded-full bg-brand text-white shadow-float"><Icon size={24} aria-hidden /></span>
          ) : <Icon size={22} aria-hidden />}
          {label}
        </Link>
      ))}
    </nav>
  );
}
