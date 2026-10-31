import { Suspense } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* The nav reads the current URL, so it streams in on dynamic routes */}
      <Suspense fallback={<div className="hidden h-16 border-b border-line bg-surface lg:block" />}>
        <TopBar />
      </Suspense>
      <main className="min-w-0 flex-1 pb-16 lg:pb-0">{children}</main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
