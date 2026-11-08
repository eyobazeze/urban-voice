"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Info, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";

const input =
  "h-[52px] w-full rounded-2xl border bg-surface pl-12 pr-4 text-[15px] shadow-card placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10";
const icon = "pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ mode, next, notice, portal = "citizen" }: { mode: "login" | "signup"; next?: string; notice?: string; portal?: "citizen" | "gov" }) {
  const router = useRouter();
  const gov = portal === "gov";
  const signup = mode === "signup" && !gov;
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
  const target = gov ? (safeNext(next).startsWith("/gov") ? safeNext(next) : "/gov") : safeNext(next);

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
        if (/not confirmed/i.test(err.message)) { router.push(`${gov ? "/gov" : ""}/verify?email=${encodeURIComponent(addr)}`); return; }
        throw err;
      }
      if (gov) {
        const { data: who } = await supabase.auth.getUser();
        const { data: row } = await supabase.from("profiles").select("role").eq("id", who.user?.id ?? "").maybeSingle();
        if (row?.role !== "gov") {
          setError("This account doesn't have staff access. Ask an administrator to enable it, or use the citizen site.");
          setBusy(false);
          return;
        }
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

  const longEnough = password.length >= 8;

  return (
    <div className="w-full max-w-[420px]">
      {gov && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand-deep">
          <ShieldCheck size={14} aria-hidden /> Staff portal
        </span>
      )}
      <h1 className={`${gov ? "mt-3" : ""} font-display text-[34px] font-bold leading-tight tracking-tight`}>
        {signup ? "Create your account" : gov ? "Staff sign in" : "Welcome back"}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {signup ? "Report problems, follow their progress, and see your city respond." : gov ? "Sign in to review, assign and resolve citizen complaints." : "Sign in to follow your reports and join the discussion."}
      </p>

      {demo && (
        <p className="mt-5 flex gap-2.5 rounded-2xl bg-sky-50 px-4 py-3 text-[13px] leading-relaxed text-sky-900 ring-1 ring-sky-100">
          <Info size={17} aria-hidden className="mt-0.5 shrink-0" />
          <span>{gov ? "Demo mode: any details work. You\u2019ll enter the portal as a sample staff member." : "Demo mode: any details work and nothing is stored. You\u2019ll browse as the sample citizen."}</span>
        </p>
      )}
      {notice && <p role="alert" className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">{notice}</p>}

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
        {signup && (
          <div>
            <label htmlFor="name" className="text-sm font-semibold">Full name</label>
            <div className="relative mt-2">
              <User aria-hidden className={icon} />
              <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Selam Tadesse"
                aria-invalid={!!shown("name")} className={`${input} ${shown("name") ? "border-rose-400" : "border-line"}`} />
            </div>
            {shown("name") && <p role="alert" className="mt-1.5 text-sm text-rose-600">{shown("name")}</p>}
          </div>
        )}
        <div>
          <label htmlFor="email" className="text-sm font-semibold">Email</label>
          <div className="relative mt-2">
            <Mail aria-hidden className={icon} />
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              aria-invalid={!!shown("email")} className={`${input} ${shown("email") ? "border-rose-400" : "border-line"}`} />
          </div>
          {shown("email") && <p role="alert" className="mt-1.5 text-sm text-rose-600">{shown("email")}</p>}
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-semibold">Password</label>
          <div className="relative mt-2">
            <Lock aria-hidden className={icon} />
            <input id="password" type={show ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder={signup ? "Create a password" : "Your password"} aria-invalid={!!shown("password")}
              className={`${input} pr-12 ${shown("password") ? "border-rose-400" : "border-line"}`} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-slate-100">
              {show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
            </button>
          </div>
          {shown("password") && <p role="alert" className="mt-1.5 text-sm text-rose-600">{shown("password")}</p>}
          {signup && !shown("password") && (
            <p className={`mt-1.5 flex items-center gap-1.5 text-[13px] ${longEnough ? "text-brand-deep" : "text-muted"}`}>
              <Check size={14} aria-hidden className={longEnough ? "" : "opacity-30"} /> At least 8 characters
            </p>
          )}
        </div>

        {error && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}

        <button type="submit" disabled={busy}
          className="group inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white shadow-[0_12px_24px_-12px_rgb(27_133_0/0.8)] transition-all hover:bg-brand-deep disabled:opacity-60">
          {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
          {signup ? "Create account" : "Sign in"}
          {!busy && <ArrowRight size={18} aria-hidden className="transition-transform group-hover:translate-x-0.5" />}
        </button>
      </form>

      {gov ? (
        <p className="mt-8 text-center text-sm text-muted">
          Staff accounts are created by an administrator.<br />Not staff?{" "}
          <Link href="/" className="font-semibold text-brand-deep hover:underline">Go to the citizen site</Link>
        </p>
      ) : (
        <p className="mt-8 text-center text-sm text-muted">
          {signup ? "Already have an account? " : "New to UrbanVoice? "}
          <Link href={`${signup ? "/login" : "/signup"}${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-deep hover:underline">
            {signup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      )}
    </div>
  );
}
