import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session and gives an early redirect for signed-out visitors.
// Real authorisation lives in Postgres row-level security (see supabase/schema.sql).
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next(); // demo mode: no backend yet

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isGov = path.startsWith("/gov") && !path.startsWith("/gov/login") && !path.startsWith("/gov/verify");
  const isCitizenPrivate = ["/reports/new", "/profile", "/settings"].some((p) => path.startsWith(p));

  if (data.user && ["/login", "/signup"].includes(path)) {
    const dest = request.nextUrl.clone();
    dest.pathname = "/";
    dest.search = "";
    return NextResponse.redirect(dest);
  }

  if (!data.user && (isGov || isCitizenPrivate)) {
    const dest = request.nextUrl.clone();
    dest.pathname = isGov ? "/gov/login" : "/login";
    dest.searchParams.set("next", path);
    return NextResponse.redirect(dest);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
