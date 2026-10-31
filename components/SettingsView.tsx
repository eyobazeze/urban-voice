"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import type { Profile, Settings } from "@/lib/profile-types";
import { HANDLE_PATTERN } from "@/lib/profile-types";
import { resetDemoData, useDemoProfile, useHydrated } from "@/lib/demo-store";
import { changePassword, saveAccount, saveSettings } from "@/lib/profile-api";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "./ConfirmDialog";
import { Switch } from "./ui/Switch";

const card = "scroll-mt-24 rounded-3xl border border-line bg-surface p-5 lg:p-6";
const field = "h-12 w-full rounded-xl border bg-surface px-4 text-[15px] focus:border-brand focus:outline-none";
const primary = "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60";

const NAV = [
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Privacy & security" },
];

const TOGGLES: { key: keyof Settings; title: string; hint: string }[] = [
  { key: "notifyStatus", title: "Status updates", hint: "When the city changes the status of one of your reports." },
  { key: "notifyComments", title: "Comments", hint: "When someone comments on one of your reports." },
  { key: "notifyDigest", title: "Weekly summary", hint: "A short digest of what is being reported near you." },
];

// Demo choices live in this browser, so wait until the page is running there before filling in the form.
export function SettingsView({ profile }: { profile: Profile }) {
  const hydrated = useHydrated();
  if (profile.demo && !hydrated) return <div className="mx-auto m-8 h-96 max-w-4xl animate-pulse rounded-3xl bg-slate-100" aria-busy />;
  return <SettingsForm profile={profile} />;
}

function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const demoProfile = useDemoProfile();

  // Account
  const [name, setName] = useState((profile.demo && demoProfile.name) || profile.name);
  const [handle, setHandle] = useState((profile.demo && demoProfile.handle) || profile.handle);
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [accountTried, setAccountTried] = useState(false);

  // Notifications
  const [settings, setSettings] = useState<Settings>((profile.demo && demoProfile.settings) || profile.settings);
  const [notifyMsg, setNotifyMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Security
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwTried, setPwTried] = useState(false);

  // Demo reset
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const lastToggle = useRef(0);

  const nameErr = name.trim().length < 2 ? "Enter your name" : null;
  const handleErr = HANDLE_PATTERN.test(handle) ? null : "Use 3 to 20 lowercase letters, numbers, dots or underscores";
  const pwErr = pw.length < 8 ? "Use at least 8 characters" : null;
  const pw2Err = pw2 !== pw ? "The passwords don't match" : null;

  const onSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountTried(true);
    setAccountMsg(null);
    if (nameErr || handleErr) return;
    setAccountBusy(true);
    try {
      await saveAccount({ name: name.trim(), handle });
      setAccountMsg({ ok: true, text: "Saved." });
      router.refresh();
    } catch (err) {
      setAccountMsg({ ok: false, text: err instanceof Error ? err.message : "Your changes couldn't be saved." });
    } finally {
      setAccountBusy(false);
    }
  };

  const onToggle = async (key: keyof Settings, value: boolean) => {
    const previous = settings;
    const next = { ...settings, [key]: value };
    const mine = ++lastToggle.current;
    setSettings(next);
    setNotifyMsg(null);
    try {
      await saveSettings(next);
      if (mine === lastToggle.current) setNotifyMsg({ ok: true, text: "Saved." });
    } catch (err) {
      setSettings(previous);
      setNotifyMsg({ ok: false, text: err instanceof Error ? err.message : "That setting couldn't be saved." });
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwTried(true);
    setPwMsg(null);
    if (pwErr || pw2Err) return;
    setPwBusy(true);
    try {
      await changePassword(pw);
      setPw(""); setPw2(""); setPwTried(false);
      setPwMsg({ ok: true, text: "Your password has been changed." });
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : "Your password couldn't be changed." });
    } finally {
      setPwBusy(false);
    }
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  const doReset = () => {
    resetDemoData();
    setResetting(false);
    setResetMsg("Demo data reset.");
    setName(profile.name); setHandle(profile.handle); setSettings(profile.settings);
    router.refresh();
  };

  const msg = (m: { ok: boolean; text: string } | null) =>
    m && <p role="status" className={`text-sm ${m.ok ? "text-brand-deep" : "text-rose-600"}`}>{m.text}</p>;

  return (
    <div className="mx-auto max-w-4xl p-4 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8 lg:p-8">
      <aside className="hidden lg:block">
        <nav aria-label="Settings sections" className="sticky top-24 space-y-1">
          <h1 className="mb-3 font-display text-2xl font-bold">Settings</h1>
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className="block rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-slate-100 hover:text-ink">{n.label}</a>
          ))}
        </nav>
      </aside>

      <div className="space-y-5">
        <h1 className="font-display text-2xl font-bold lg:hidden">Settings</h1>

        <section id="account" className={card} aria-labelledby="account-h">
          <h2 id="account-h" className="font-display text-lg font-bold">Account</h2>
          <form onSubmit={onSaveAccount} noValidate className="mt-4 space-y-4">
            <div>
              <label htmlFor="s-name" className="text-sm font-semibold">Full name</label>
              <input id="s-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={accountTried && !!nameErr}
                className={`${field} mt-2 ${accountTried && nameErr ? "border-rose-400" : "border-line"}`} />
              {accountTried && nameErr && <p role="alert" className="mt-1.5 text-sm text-rose-600">{nameErr}</p>}
            </div>
            <div>
              <label htmlFor="s-handle" className="text-sm font-semibold">Username</label>
              <div className="relative mt-2">
                <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
                <input id="s-handle" value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase())} autoComplete="username"
                  aria-invalid={accountTried && !!handleErr} className={`${field} pl-9 ${accountTried && handleErr ? "border-rose-400" : "border-line"}`} />
              </div>
              {accountTried && handleErr && <p role="alert" className="mt-1.5 text-sm text-rose-600">{handleErr}</p>}
            </div>
            <div>
              <label htmlFor="s-email" className="text-sm font-semibold">Email</label>
              <input id="s-email" value={profile.email} readOnly className={`${field} mt-2 border-line bg-slate-50 text-muted`} />
              <p className="mt-1.5 text-xs text-muted">Your email is used to sign in and can&rsquo;t be changed here.</p>
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" disabled={accountBusy} className={primary}>
                {accountBusy && <Loader2 size={16} className="animate-spin" aria-hidden />} Save changes
              </button>
              {msg(accountMsg)}
            </div>
          </form>
        </section>

        <section id="notifications" className={card} aria-labelledby="notif-h">
          <div className="flex items-center justify-between gap-4">
            <h2 id="notif-h" className="font-display text-lg font-bold">Notifications</h2>
            {msg(notifyMsg)}
          </div>
          <ul className="mt-2 divide-y divide-line">
            {TOGGLES.map(({ key, title, hint }) => (
              <li key={key} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p id={`t-${key}`} className="text-[15px] font-semibold">{title}</p>
                  <p className="mt-0.5 text-sm text-muted">{hint}</p>
                </div>
                <Switch checked={settings[key]} onChange={(v) => onToggle(key, v)} labelledBy={`t-${key}`} />
              </li>
            ))}
          </ul>
        </section>

        <section id="security" className={card} aria-labelledby="sec-h">
          <h2 id="sec-h" className="font-display text-lg font-bold">Privacy &amp; security</h2>
          {profile.demo ? (
            <p className="mt-3 rounded-xl bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-900">
              Password changes and sign-out are available once the backend is connected. In demo mode there is no account to protect.
            </p>
          ) : (
            <>
              <form onSubmit={onChangePassword} noValidate className="mt-4 space-y-4">
                <div>
                  <label htmlFor="s-pw" className="text-sm font-semibold">New password</label>
                  <input id="s-pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)}
                    aria-invalid={pwTried && !!pwErr} className={`${field} mt-2 ${pwTried && pwErr ? "border-rose-400" : "border-line"}`} />
                  {pwTried && pwErr && <p role="alert" className="mt-1.5 text-sm text-rose-600">{pwErr}</p>}
                </div>
                <div>
                  <label htmlFor="s-pw2" className="text-sm font-semibold">Confirm new password</label>
                  <input id="s-pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)}
                    aria-invalid={pwTried && !!pw2Err} className={`${field} mt-2 ${pwTried && pw2Err ? "border-rose-400" : "border-line"}`} />
                  {pwTried && pw2Err && <p role="alert" className="mt-1.5 text-sm text-rose-600">{pw2Err}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <button type="submit" disabled={pwBusy} className={primary}>
                    {pwBusy && <Loader2 size={16} className="animate-spin" aria-hidden />} Change password
                  </button>
                  {msg(pwMsg)}
                </div>
              </form>
              <div className="mt-6 border-t border-line pt-5">
                <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">
                  <LogOut size={16} aria-hidden /> Sign out
                </button>
              </div>
            </>
          )}
        </section>

        {profile.demo && (
          <section className={card} aria-labelledby="demo-h">
            <h2 id="demo-h" className="font-display text-lg font-bold">Demo data</h2>
            <p className="mt-2 text-sm text-muted">
              Reports you file, reports you delete, and the changes on this page are kept in this browser only. Reset to start again with the original sample data.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <button onClick={() => { setResetMsg(null); setResetting(true); }} className="rounded-full border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50">
                Reset demo data
              </button>
              {resetMsg && <p role="status" className="text-sm text-brand-deep">{resetMsg}</p>}
            </div>
            <ConfirmDialog open={resetting} title="Reset demo data?" confirmLabel="Reset" cancelLabel="Cancel" onConfirm={doReset} onCancel={() => setResetting(false)}>
              <p>This removes the reports you filed, brings back any sample reports you deleted, and resets your name, username, and notification choices.</p>
            </ConfirmDialog>
          </section>
        )}
      </div>
    </div>
  );
}
