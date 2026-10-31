"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";

const input =
  "h-12 w-full rounded-xl border bg-surface px-4 text-[15px] placeholder:text-muted focus:border-brand focus:outline-none";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ mode, next, notice }: { mode: "login" | "signup"; next?: string; notice?: string }) {
  const router = useRouter();
  const signup = mode === "signup";
  const demo = !isSupabaseConfigured();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const problems = {
    name: signup && name.trim().length < 2 ? "Enter your name" : null,
    email: EMAIL.test(email.trim()) ? null : "Enter a valid email address",
    password: password.length >= 8 ? null : "Use at least 8 characters",
  };
  const shown = (k: keyof typeof problems) => (attempted ? problems[k] : null);
  const target = safeNext(next);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    setError(null);
    if (problems.name || problems.email || problems.password) return;
    const addr = email.trim();
    setBusy(true);

    if (demo) {
      // No backend yet: walk through the screens without creating anything.
      router.push(signup ? `/verify?email=${encodeURIComponent(addr)}` : target);
      return;
    }

    const supabase = createClient();
    try {
      if (signup) {
        const { data, error: err } = await supabase.auth.signUp({
          email: addr, password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(target)}`,
          },
        });
        if (err) throw err;
        // Email confirmation switched off: signed in straight away
        if (data.session) { router.push(target); router.refresh(); return; }
        router.push(`/verify?email=${encodeURIComponent(addr)}`);
        return;
      }
      const { error: err } = await supabase.auth.signInWithPassword({ email: addr, password });
      if (err) {
        if (/not confirmed/i.test(err.message)) { router.push(`/verify?email=${encodeURIComponent(addr)}`); return; }
        throw err;
      }
      router.push(target);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (/invalid login/i.test(msg)) setError("That email and password don't match.");
      else if (/already registered/i.test(msg)) setError("An account with that email already exists. Try signing in instead.");
      else if (/rate limit/i.test(msg)) setError("Too many attempts for now. Please wait a few minutes and try again.");
      else setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl font-bold">{signup ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-muted">
        {signup ? "Report problems, follow their progress, and see your city respond." : "Sign in to follow your reports and join the discussion."}
      </p>

      {demo && (
        <p className="mt-5 flex gap-2.5 rounded-xl bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-900">
          <Info size={18} aria-hidden className="mt-0.5 shrink-0" />
          <span>Demo mode: the backend isn&rsquo;t connected, so any details work and nothing is stored. You&rsquo;ll browse as the sample citizen.</span>
        </p>
      )}
      {notice && <p role="alert" className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{notice}</p>}

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {signup && (
          <div>
            <label htmlFor="name" className="text-sm font-semibold">Full name</label>
            <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
              aria-invalid={!!shown("name")} className={`${input} mt-2 ${shown("name") ? "border-rose-400" : "border-line"}`} />
            {shown("name") && <p role="alert" className="mt-1.5 text-sm text-rose-600">{shown("name")}</p>}
          </div>
        )}
        <div>
          <label htmlFor="email" className="text-sm font-semibold">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!shown("email")} className={`${input} mt-2 ${shown("email") ? "border-rose-400" : "border-line"}`} />
          {shown("email") && <p role="alert" className="mt-1.5 text-sm text-rose-600">{shown("email")}</p>}
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-semibold">Password</label>
          <div className="relative mt-2">
            <input id="password" type={show ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!shown("password")}
              className={`${input} pr-12 ${shown("password") ? "border-rose-400" : "border-line"}`} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-slate-100">
              {show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
            </button>
          </div>
          {shown("password") && <p role="alert" className="mt-1.5 text-sm text-rose-600">{shown("password")}</p>}
        </div>

        {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <button type="submit" disabled={busy}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60">
          {busy && <Loader2 size={18} className="animate-spin" aria-hidden />}
          {signup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {signup ? "Already have an account? " : "New to UrbanVoice? "}
        <Link href={`${signup ? "/login" : "/signup"}${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-deep hover:underline">
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
