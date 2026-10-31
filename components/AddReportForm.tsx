"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LocateFixed, Loader2, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";
import { compressImage } from "@/lib/image";
import { NotSignedInError, submitReport } from "@/lib/reports-api";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import LocationPicker from "./LocationPickerLoader";
import type { LatLng } from "./LocationPicker";

const MAX_PHOTOS = 3;
type Photo = { id: string; blob: Blob; url: string };

async function lookupAddress(p: LatLng, signal: AbortSignal): Promise<string | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&accept-language=en&lat=${p[0]}&lon=${p[1]}`,
    { signal },
  );
  if (!res.ok) return null;
  const j = await res.json();
  const a = j.address ?? {};
  const parts: string[] = [a.road ?? a.pedestrian ?? a.neighbourhood, a.suburb ?? a.city_district ?? a.city].filter(Boolean);
  if (parts.length) return [...new Set(parts)].join(", ");
  return typeof j.display_name === "string" ? j.display_name.split(",").slice(0, 2).join(",").trim() : null;
}

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-4 text-[15px] placeholder:text-muted focus:border-brand focus:outline-none";

export function AddReportForm() {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pos, setPos] = useState<LatLng | null>(null);
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [attempted, setAttempted] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [error, setError] = useState<{ text: string; signIn?: boolean } | null>(null);

  const addressTouched = useRef(false);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookupAbort = useRef<AbortController | null>(null);
  const photosRef = useRef<Photo[]>([]);
  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => () => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    lookupAbort.current?.abort();
    photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  const errors = {
    category: category ? null : "Choose a category",
    title: title.trim().length >= 5 ? null : "Add a short title (at least 5 characters)",
    location: pos ? null : "Tap the map to mark where it is",
  };
  const show = (k: keyof typeof errors) => (attempted && errors[k] ? errors[k] : null);

  // Fill the address from the map position, unless the person has typed their own
  const pick = (p: LatLng) => {
    setPos(p);
    setLocError(null);
    if (addressTouched.current) return;
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(async () => {
      lookupAbort.current?.abort();
      const ctl = new AbortController();
      lookupAbort.current = ctl;
      setLookingUp(true);
      try {
        const found = await lookupAddress(p, ctl.signal);
        if (found && !addressTouched.current) setAddress(found);
      } catch { /* offline or blocked: the person can type the address */ }
      finally { if (lookupAbort.current === ctl) setLookingUp(false); }
    }, 500);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setLocError("Your browser can't share its location. Tap the map instead."); return; }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (g) => { setLocating(false); pick([g.coords.latitude, g.coords.longitude]); },
      () => { setLocating(false); setLocError("Couldn't get your location. Tap the map instead."); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoError(null);
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const picked = images.slice(0, MAX_PHOTOS - photos.length);
    if (images.length > picked.length) setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`);
    else if (images.length < files.length) setPhotoError("Only image files can be added.");
    if (!picked.length) return;
    setCompressing(true);
    try {
      const next = await Promise.all(
        picked.map(async (f) => {
          const blob = await compressImage(f);
          return { id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) };
        }),
      );
      setPhotos((cur) => [...cur, ...next]);
    } catch {
      setPhotoError("One of those photos couldn't be read. Try a different one.");
    } finally {
      setCompressing(false);
    }
  };

  const removePhoto = (id: string) =>
    setPhotos((cur) => {
      cur.filter((p) => p.id === id).forEach((p) => URL.revokeObjectURL(p.url));
      return cur.filter((p) => p.id !== id);
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    setError(null);
    if (errors.category || errors.title || errors.location || !pos || !category) {
      document.querySelector<HTMLElement>("[data-invalid='true']")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const { id } = await submitReport({
        title: title.trim(), body: body.trim(), category,
        lat: pos[0], lng: pos[1],
        address: address.trim() || `${pos[0].toFixed(5)}, ${pos[1].toFixed(5)}`,
        photos: photos.map((p) => p.blob),
      });
      router.push(`/reports/${id}`);
    } catch (err) {
      if (err instanceof NotSignedInError) setError({ text: "Please sign in to submit a report.", signIn: true });
      else if (!isSupabaseConfigured()) setError({ text: "This browser couldn't store the report. Try fewer or smaller photos." });
      else setError({ text: err instanceof Error ? err.message : "Something went wrong and your report wasn't sent. Please try again." });
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 lg:p-8">
      <h1 className="font-display text-2xl font-bold lg:text-3xl">Add a report</h1>
      <p className="mt-1 text-muted">Tell the city what needs attention. You can follow its progress under My reports.</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-x-10">
        <fieldset className="lg:col-start-1 lg:row-start-1" data-invalid={!!show("category")}>
          <legend className="text-sm font-semibold">Category</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Category">
            {CATEGORIES.map(({ id, label, Icon, color }) => {
              const on = category === id;
              return (
                <button
                  key={id} type="button" role="radio" aria-checked={on} onClick={() => setCategory(id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                    on ? "border-transparent text-white" : "border-line bg-surface hover:bg-slate-50"
                  }`}
                  style={on ? { background: color } : undefined}
                >
                  <Icon size={16} aria-hidden style={on ? undefined : { color }} /> {label}
                </button>
              );
            })}
          </div>
          {show("category") && <p role="alert" className="mt-1.5 text-sm text-rose-600">{show("category")}</p>}
        </fieldset>

        <div className="lg:col-start-1 lg:row-start-2" data-invalid={!!show("title")}>
          <label htmlFor="title" className="text-sm font-semibold">Title</label>
          <input
            id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140}
            placeholder="For example: Deep pothole outside the church gate"
            aria-invalid={!!show("title")} aria-describedby={show("title") ? "title-err" : undefined}
            className={`${inputCls} mt-2 h-12`}
          />
          <div className="mt-1.5 flex justify-between text-sm">
            <span id="title-err" role="alert" className="text-rose-600">{show("title")}</span>
            <span className="text-muted">{title.length}/140</span>
          </div>
        </div>

        <div className="lg:col-start-1 lg:row-start-3">
          <label htmlFor="body" className="text-sm font-semibold">Details <span className="font-normal text-muted">(optional)</span></label>
          <textarea
            id="body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={1000} rows={4}
            placeholder="What is the problem, how long has it been there, and who does it affect?"
            className={`${inputCls} mt-2 py-3 leading-relaxed`}
          />
        </div>

        <section className="flex flex-col lg:col-start-2 lg:row-span-4 lg:row-start-1" aria-labelledby="loc-h" data-invalid={!!show("location")}>
          <h2 id="loc-h" className="text-sm font-semibold">Location</h2>
          <p className="mt-1 text-sm text-muted">Tap the map to drop a pin, then drag it to fine-tune.</p>
          <div className="relative isolate mt-2 min-h-[300px] flex-1 overflow-hidden rounded-2xl border border-line">
            <LocationPicker value={pos} onChange={pick} />
          </div>
          {show("location") && <p role="alert" className="mt-1.5 text-sm text-rose-600">{show("location")}</p>}
          <button
            type="button" onClick={useMyLocation} disabled={locating}
            className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            {locating ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <LocateFixed size={16} aria-hidden />}
            Use my location
          </button>
          {locError && <p role="alert" className="mt-1.5 text-sm text-rose-600">{locError}</p>}
          <label htmlFor="address" className="mt-4 text-sm font-semibold">Address or landmark</label>
          <div className="relative mt-2">
            <input
              id="address" value={address} placeholder="Filled in from the map, or type your own"
              onChange={(e) => { addressTouched.current = true; setAddress(e.target.value); }}
              className={`${inputCls} h-12`}
            />
            {lookingUp && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-muted" aria-label="Looking up address" />}
          </div>
        </section>

        <section className="lg:col-start-1 lg:row-start-4" aria-labelledby="photos-h">
          <h2 id="photos-h" className="text-sm font-semibold">Photos <span className="font-normal text-muted">(optional, up to {MAX_PHOTOS})</span></h2>
          <ul className="mt-2 flex flex-wrap gap-3">
            {photos.map((p, i) => (
              <li key={p.id} className="relative size-24 overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                <button type="button" onClick={() => removePhoto(p.id)} aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80">
                  <X size={14} aria-hidden />
                </button>
              </li>
            ))}
            {photos.length < MAX_PHOTOS && (
              <li>
                <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-surface text-xs text-muted hover:border-brand hover:text-brand-deep focus-within:border-brand">
                  <input type="file" accept="image/*" multiple className="sr-only" disabled={compressing}
                    onChange={(e) => { void addFiles(e.target.files); e.target.value = ""; }} />
                  {compressing ? <Loader2 size={22} className="animate-spin" aria-hidden /> : <ImagePlus size={22} aria-hidden />}
                  {compressing ? "Preparing" : "Add photo"}
                </label>
              </li>
            )}
          </ul>
          {photoError && <p role="alert" className="mt-1.5 text-sm text-rose-600">{photoError}</p>}
        </section>

        <div className="lg:col-start-1 lg:row-start-5">
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error.text}{" "}
              {error.signIn && <Link href="/login?next=/reports/new" className="font-semibold underline">Sign in</Link>}
            </p>
          )}
          <button
            type="submit" disabled={submitting || compressing}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
          >
            {submitting && <Loader2 size={18} className="animate-spin" aria-hidden />}
            {submitting ? "Sending…" : "Submit report"}
          </button>
        </div>
      </form>
    </div>
  );
}
