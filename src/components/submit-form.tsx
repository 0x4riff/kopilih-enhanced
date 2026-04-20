"use client";

import Link from "next/link";
import { useState } from "react";

import { amenityOptions } from "@/lib/data";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import type { Amenity, CoffeeSubmission, PriceRange } from "@/lib/types";
import { formatStatusLabel } from "@/lib/utils";

const initialFormState = {
  name: "",
  city: "",
  neighborhood: "",
  address: "",
  description: "",
  priceRange: "$$" as PriceRange,
  vibes: "Work-friendly, Cozy",
  amenities: ["WiFi cepat", "Indoor AC"] as Amenity[],
  imageUrl: "",
  mapsUrl: "",
  instagramUrl: "",
};

function TextField({ hint, label, onChange, value }: { hint?: string; label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label} {hint ? <span className="normal-case tracking-normal text-slate-400">{hint}</span> : null}
      </span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400" />
    </label>
  );
}

function TextAreaField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400" />
    </label>
  );
}

function SelectField({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function InfoCard({ body, eyebrow, title }: { body: string; eyebrow: string; title: string }) {
  return (
    <section className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold leading-none text-slate-950">{title}</h2>
      <p className="mt-4 text-sm leading-6 text-slate-500">{body}</p>
    </section>
  );
}

export function SubmitForm() {
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<CoffeeSubmission | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const vibes = form.vibes.split(",").map((item) => item.trim()).filter(Boolean);

    if (!form.name.trim() || !form.city.trim() || !form.neighborhood.trim() || !form.address.trim() || !form.description.trim()) {
      setError("Lengkapi detail utama cafe sebelum mengirim rekomendasi.");
      return;
    }

    if (vibes.length === 0) {
      setError("Tambahkan minimal satu vibe, pisahkan dengan koma.");
      return;
    }

    if (form.amenities.length === 0) {
      setError("Pilih minimal satu fasilitas.");
      return;
    }

    if (!hasSupabaseEnv()) {
      setError("Layanan pengiriman sedang belum siap. Coba lagi beberapa saat lagi.");
      return;
    }

    setError("");
    setSending(true);

    try {
      const supabase = getSupabaseBrowserClient() as any;
      const payload = {
        name: form.name.trim(),
        slug: `${form.name}-${form.city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        city: form.city.trim(),
        neighborhood: form.neighborhood.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        price_range: form.priceRange,
        vibes,
        amenities: form.amenities,
        image_url: form.imageUrl.trim() || null,
        maps_url: form.mapsUrl.trim() || null,
        instagram_url: form.instagramUrl.trim() || null,
        status: "pending",
      };

      const { data, error: insertError } = await supabase
        .from("cafe_submissions")
        .insert(payload)
        .select("*")
        .single();

      if (insertError) throw insertError;

      setSubmitted({
        id: data.id,
        slug: data.slug,
        name: data.name,
        city: data.city,
        neighborhood: data.neighborhood ?? undefined,
        address: data.address,
        description: data.description,
        priceRange: data.price_range,
        vibes: data.vibes ?? [],
        amenities: data.amenities ?? [],
        imageUrl: data.image_url ?? "",
        mapsUrl: data.maps_url ?? "",
        instagramUrl: data.instagram_url ?? "",
        submittedAt: data.created_at ?? new Date().toISOString(),
        status: data.status,
        adminNote: data.admin_note ?? undefined,
      });

      setForm(initialFormState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rekomendasi cafe belum berhasil dikirim.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[34px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">KOPILIH submissions</p>
          <h1 className="mt-3 text-5xl font-semibold leading-none text-slate-950">Ajukan cafe baru untuk masuk ke katalog KOPILIH.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">Kirim detail tempat yang layak direkomendasikan. Tim kurasi akan meninjau sebelum listing tampil untuk publik.</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Nama cafe" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
              <TextField label="Kota" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
              <TextField label="Area" value={form.neighborhood} onChange={(value) => setForm((current) => ({ ...current, neighborhood: value }))} />
              <SelectField label="Rentang harga" value={form.priceRange} onChange={(value) => setForm((current) => ({ ...current, priceRange: value as PriceRange }))} options={["$", "$$", "$$$"]} />
            </div>

            <TextField label="Alamat" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
            <TextAreaField label="Deskripsi singkat" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
            <TextField label="Vibe" hint="Pisahkan dengan koma" value={form.vibes} onChange={(value) => setForm((current) => ({ ...current, vibes: value }))} />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Fasilitas</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {amenityOptions.map((amenity) => {
                  const active = form.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, amenities: active ? current.amenities.filter((item) => item !== amenity) : [...current.amenities, amenity] }))}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition ${active ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300 bg-white text-slate-900 hover:border-amber-300 hover:bg-amber-50"}`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="URL gambar" hint="Opsional" value={form.imageUrl} onChange={(value) => setForm((current) => ({ ...current, imageUrl: value }))} />
              <TextField label="URL Google Maps" hint="Opsional" value={form.mapsUrl} onChange={(value) => setForm((current) => ({ ...current, mapsUrl: value }))} />
              <TextField label="URL Instagram" hint="Opsional" value={form.instagramUrl} onChange={(value) => setForm((current) => ({ ...current, instagramUrl: value }))} />
            </div>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={sending} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60">
                {sending ? "Mengirim..." : "Kirim rekomendasi"}
              </button>
              <Link href="/admin/submissions" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300">
Buka meja review
              </Link>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <InfoCard eyebrow="Proses" title="Apa yang terjadi setelah dikirim?" body="Setelah masuk, detail cafe akan ditinjau dulu untuk memastikan informasi dan kualitas listing tetap rapi." />
          <InfoCard eyebrow="Standar" title="Apa yang membuat listing layak tayang?" body="Alamat jelas, deskripsi jujur, vibe relevan, dan tautan pendukung akan membantu cafe lebih cepat lolos review." />

          {submitted ? (
            <section className="rounded-[30px] border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Rekomendasi diterima</p>
              <h2 className="mt-2 text-3xl font-semibold leading-none text-slate-950">{submitted.name}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">Status saat ini: {formatStatusLabel(submitted.status)}. Selanjutnya listing akan masuk tahap review sebelum tayang.</p>
              <div className="mt-5 flex gap-3">
                <Link href="/admin/submissions" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm">Lihat meja review</Link>
                <Link href="/" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">Kembali ke beranda</Link>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
