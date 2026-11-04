"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import type { Staff } from "@/lib/gov-types";
import { changePassword, saveName } from "@/lib/profile-api";
import { createClient } from "@/lib/supabase/client";
import { Panel } from "./bits";

const field = "h-12 w-full rounded-xl border bg-surface px-4 text-[15px] focus:border-brand focus:outline-none";
const primary = "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60";

export function GovSettings({ staff }: { staff: Staff }) {
  const router = useRouter();
  const [name, setName] = useState(staff.name);
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [nameBusy, setNameBusy] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwTried, setPwTried] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const pwErr = pw.length < 8 ? "Use at least 8 characters" : null;
  const pw2Err = pw2 !== pw ? "The passwords don't match" : null;
  const msg = (m: { ok: boolean; text: string } | null) => m && <p role="status" className={`text-sm ${m.ok ? "text-brand-deep" : "text-rose-600"}`}>{m.text}</p>;

  const onName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { setNameMsg({ ok: false, text: "Enter your name" }); return; }
    setNameBusy(true); setNameMsg(null);
    try { await saveName(name.trim()); setNameMsg({ ok: true, text: "Saved." }); router.refresh(); }
    catch (err) { setNameMsg({ ok: false, text: err instanceof Error ? err.message : "Couldn't save." }); }
    finally { setNameBusy(false); }
  };
  const onPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwTried(true); setPwMsg(null);
    if (pwErr || pw2Err) return;
    setPwBusy(true);
    try { await changePassword(pw); setPw(""); setPw2(""); setPwTried(false); setPwMsg({ ok: true, text: "Your password has been changed." }); }
    catch (err) { setPwMsg({ ok: false, text: err instanceof Error ? err.message : "Couldn't change the password." }); }
    finally { setPwBusy(false); }
  };
  const signOut = async () => {
    if (!staff.demo) await createClient().auth.signOut();
    router.push("/gov/login");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <Panel title="Your account">
        {staff.demo && <p className="mb-4 rounded-xl bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-900">Demo mode: this is a sample staff account, so it can&rsquo;t be edited. Connect Supabase to manage real staff accounts.</p>}
        <form onSubmit={onName} noValidate className="space-y-4">
          <div>
            <label htmlFor="g-name" className="text-sm font-semibold">Full name</label>
            <input id="g-name" value={name} onChange={(e) => setName(e.target.value)} disabled={staff.demo} className={`${field} mt-2 border-line disabled:bg-slate-50 disabled:text-muted`} />
          </div>
          <div>
            <label htmlFor="g-email" className="text-sm font-semibold">Email</label>
            <input id="g-email" value={staff.email} readOnly className={`${field} mt-2 border-line bg-slate-50 text-muted`} />
          </div>
          <div>
            <label htmlFor="g-title" className="text-sm font-semibold">Role</label>
            <input id="g-title" value={staff.title} readOnly className={`${field} mt-2 border-line bg-slate-50 text-muted`} />
          </div>
          {!staff.demo && (
            <div className="flex items-center gap-4">
              <button type="submit" disabled={nameBusy} className={primary}>{nameBusy && <Loader2 size={16} className="animate-spin" aria-hidden />} Save changes</button>
              {msg(nameMsg)}
            </div>
          )}
        </form>
      </Panel>

      {!staff.demo && (
        <Panel title="Password">
          <form onSubmit={onPassword} noValidate className="space-y-4">
            <div>
              <label htmlFor="g-pw" className="text-sm font-semibold">New password</label>
              <input id="g-pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={`${field} mt-2 ${pwTried && pwErr ? "border-rose-400" : "border-line"}`} />
              {pwTried && pwErr && <p role="alert" className="mt-1.5 text-sm text-rose-600">{pwErr}</p>}
            </div>
            <div>
              <label htmlFor="g-pw2" className="text-sm font-semibold">Confirm new password</label>
              <input id="g-pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={`${field} mt-2 ${pwTried && pw2Err ? "border-rose-400" : "border-line"}`} />
              {pwTried && pw2Err && <p role="alert" className="mt-1.5 text-sm text-rose-600">{pw2Err}</p>}
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" disabled={pwBusy} className={primary}>{pwBusy && <Loader2 size={16} className="animate-spin" aria-hidden />} Change password</button>
              {msg(pwMsg)}
            </div>
          </form>
        </Panel>
      )}

      <Panel title="Session">
        <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">
          <LogOut size={16} aria-hidden /> Sign out
        </button>
      </Panel>
    </div>
  );
}
