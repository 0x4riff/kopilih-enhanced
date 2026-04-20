"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import type { CoffeeSubmission, SubmissionStatus, SupabaseSubmissionRow } from "@/lib/types";
import { formatRelativeDate, formatStatusLabel, statusTone } from "@/lib/utils";

function CountCard({ label, tone, value }: { label: string; tone: "amber" | "emerald" | "rose"; value: number }) {
  const tones = {
    amber: "bg-amber-50 text-amber-800",
    emerald: "bg-emerald-50 text-emerald-800",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className={`rounded-[28px] p-5 ${tones[tone]}`}>
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-2 text-5xl font-semibold leading-none">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  );
}

export function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<CoffeeSubmission[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadSubmissions() {
    if (!hasSupabaseEnv()) {
      setError("Koneksi katalog belum siap. Coba lagi beberapa saat lagi.");
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient() as any;
      const { data, error } = await supabase.from("cafe_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;

      const mapped: CoffeeSubmission[] = ((data ?? []) as SupabaseSubmissionRow[]).map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        city: row.city,
        neighborhood: row.neighborhood ?? undefined,
        address: row.address,
        description: row.description,
        priceRange: row.price_range,
        vibes: row.vibes ?? [],
        amenities: row.amenities ?? [],
        imageUrl: row.image_url ?? "",
        mapsUrl: row.maps_url ?? "",
        instagramUrl: row.instagram_url ?? "",
        submittedAt: row.created_at ?? new Date().toISOString(),
        status: row.status,
        adminNote: row.admin_note ?? undefined,
      }));

      setSubmissions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  const counts = useMemo(() => ({
    pending: submissions.filter((item) => item.status === "pending").length,
    approved: submissions.filter((item) => item.status === "approved").length,
    rejected: submissions.filter((item) => item.status === "rejected").length,
  }), [submissions]);

  async function reviewSubmission(submission: CoffeeSubmission, status: SubmissionStatus, adminNote?: string) {
    if (!hasSupabaseEnv()) return;

    try {
      const supabase = getSupabaseBrowserClient() as any;
      const { error: updateError } = await supabase
        .from("cafe_submissions")
        .update({ status, admin_note: adminNote ?? null })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      if (status === "approved") {
        const { error: upsertCafeError } = await supabase.from("cafes").upsert({
          submission_id: submission.id,
          name: submission.name,
          slug: submission.slug,
          city: submission.city,
          neighborhood: submission.neighborhood ?? submission.city,
          address: submission.address,
          description: submission.description,
          long_description: `${submission.description} Tempat ini masuk ke katalog setelah melewati review internal KOPILIH.`,
          price_range: submission.priceRange,
          rating: 4.4,
          review_count: 0,
          vibes: submission.vibes,
          amenities: submission.amenities,
          image_url: submission.imageUrl || null,
          maps_url: submission.mapsUrl || null,
          instagram_url: submission.instagramUrl || null,
          featured: false,
          wifi_friendly: submission.amenities.includes("WiFi cepat"),
          source: "community",
          status: "published",
        }, { onConflict: "slug" });

        if (upsertCafeError) throw upsertCafeError;
      }

      await loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to review submission.");
    }
  }

  const ordered = [...submissions].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">KOPILIH review desk</p>
            <h1 className="mt-3 text-5xl font-semibold leading-none text-slate-950">Tinjau rekomendasi cafe yang masuk.</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500">Gunakan halaman ini untuk menjaga kualitas katalog, melengkapi catatan internal, lalu menerbitkan listing yang layak tayang.</p>
          </div>

          <Link href="/submit" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300">
Buka form submit
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <CountCard label="Pending" value={counts.pending} tone="amber" />
          <CountCard label="Approved" value={counts.approved} tone="emerald" />
          <CountCard label="Rejected" value={counts.rejected} tone="rose" />
        </div>
      </section>

      {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {loading ? <div className="mt-6 rounded-2xl bg-white px-4 py-5 text-sm text-slate-500">Memuat rekomendasi masuk...</div> : null}

      <section className="mt-8 space-y-5">
        {ordered.map((submission) => {
          const note = notes[submission.id] ?? submission.adminNote ?? "";

          return (
            <article key={submission.id} className="rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-4xl font-semibold leading-none text-slate-950">{submission.name}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(submission.status)}`}>{formatStatusLabel(submission.status)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{submission.neighborhood}, {submission.city} • submitted {formatRelativeDate(submission.submittedAt)}</p>
                </div>

                {submission.status === "approved" ? (
                  <Link href={`/cafes/${submission.slug}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300">
Lihat halaman publik
                  </Link>
                ) : null}
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-4">
                  <p className="text-sm leading-7 text-slate-600">{submission.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {submission.vibes.map((vibe) => (
                      <span key={vibe} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{vibe}</span>
                    ))}
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <InfoRow label="Address" value={submission.address} />
                    <InfoRow label="Price" value={submission.priceRange} />
                    <InfoRow label="Amenities" value={submission.amenities.join(", ")} />
                    <InfoRow label="Slug" value={submission.slug} />
                  </div>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Catatan internal</span>
                    <textarea value={note} onChange={(event) => setNotes((current) => ({ ...current, [submission.id]: event.target.value }))} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400" />
                  </label>
                </div>

                <div className="rounded-[28px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tindakan</p>
                  <div className="mt-4 grid gap-3">
                    <button type="button" onClick={() => reviewSubmission(submission, "approved", note.trim() || undefined)} className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300">
Setujui dan terbitkan
                    </button>
                    <button type="button" onClick={() => reviewSubmission(submission, "rejected", note.trim() || undefined)} className="rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300">
Tolak rekomendasi
                    </button>
                    <button type="button" onClick={() => reviewSubmission(submission, "pending", note.trim() || undefined)} className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300">
Kembalikan ke review
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
