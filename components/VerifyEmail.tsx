"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const COOLDOWN = 30;

export function VerifyEmail({ email }: { email: string }) {
  const demo = !isSupabaseConfigured();
  const [wait, setWait] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const resend = async () => {
    setMsg(null);
    if (demo) { setMsg({ ok: true, text: "Demo mode: no email is sent." }); setWait(COOLDOWN); return; }
    setBusy(true);
    const { error } = await createClient().auth.resend({
      type: "signup", email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setMsg({ ok: false, text: "We couldn't send another email just now. Please wait a minute and try again." });
    else { setMsg({ ok: true, text: "Another email is on its way." }); setWait(COOLDOWN); }
  };

  return (
    <div className="w-full max-w-md text-center lg:text-left">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-tint text-brand-deep lg:mx-0">
        <MailCheck size={28} aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-3xl font-bold">Check your email</h1>
      <p className="mt-2 text-muted">
        We sent a confirmation link to {email ? <strong className="text-ink">{email}</strong> : "your email address"}. Open it to finish setting up your account.
      </p>
      <p className="mt-2 text-sm text-muted">Can&rsquo;t find it? Check your spam folder.</p>

      {demo && (
        <p className="mt-5 rounded-xl bg-sky-50 px-4 py-3 text-left text-sm leading-relaxed text-sky-900">
          Demo mode: no email was sent. In the live app, the link signs you in and brings you back here.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {demo && (
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-[15px] font-semibold text-white hover:bg-brand-deep">
            Continue to the app
          </Link>
        )}
        <button onClick={resend} disabled={busy || wait > 0}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 text-[15px] font-semibold hover:bg-slate-50 disabled:opacity-60">
          {busy && <Loader2 size={18} className="animate-spin" aria-hidden />}
          {wait > 0 ? `Resend in ${wait}s` : "Resend email"}
        </button>
      </div>
      {msg && <p role="status" className={`mt-3 text-sm ${msg.ok ? "text-brand-deep" : "text-rose-600"}`}>{msg.text}</p>}

      <p className="mt-8 text-sm text-muted">
        Wrong address? <Link href="/signup" className="font-semibold text-brand-deep hover:underline">Start again</Link>
      </p>
    </div>
  );
}
