// Only allow redirects to paths on this site (blocks open-redirect tricks like //evil.com).
export function safeNext(next?: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
