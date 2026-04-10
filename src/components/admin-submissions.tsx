"use client";

import Link from "next/link";
import { useState } from "react";

import { useDemoStore } from "@/components/demo-store-provider";
import { sortSubmissions } from "@/lib/demo-store";
import { formatRelativeDate, formatStatusLabel, statusTone } from "@/lib/utils";

function CountCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "amber" | "emerald" | "rose";
  value: number;
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-800",
    emerald: "bg-emerald-50 text-emerald-800",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className={`rounded-[28px] p-5 ${tones[tone]}`}>
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-2 font-display text-5xl leading-none">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-1">{value}</div>
    </div>
  );
}

export function AdminSubmissions() {
  const { counts, resetDemo, reviewSubmission, submissions } = useDemoStore();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const ordered = sortSubmissions(submissions);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Demo admin
            </p>
            <h1 className="mt-3 font-display text-5xl leading-none text-slate-950">
              Review community submissions.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500">
              This page is intentionally client-side only. Approving a cafe
              updates localStorage for the current browser, which then unlocks
              the listing on the public homepage.
            </p>
          </div>

          <button
            type="button"
            onClick={resetDemo}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset demo data
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <CountCard label="Pending" value={counts.pending} tone="amber" />
          <CountCard label="Approved" value={counts.approved} tone="emerald" />
          <CountCard label="Rejected" value={counts.rejected} tone="rose" />
        </div>
      </section>

      <section className="mt-8 space-y-5">
        {ordered.map((submission) => {
          const note = notes[submission.id] ?? submission.adminNote ?? "";

          return (
            <article
              key={submission.id}
              className="rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-4xl leading-none text-slate-950">
                      {submission.name}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(submission.status)}`}
                    >
                      {formatStatusLabel(submission.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {submission.neighborhood}, {submission.city} • submitted{" "}
                    {formatRelativeDate(submission.submittedAt)}
                  </p>
                </div>

                {submission.status === "approved" ? (
                  <Link
                    href={`/cafes/${submission.slug}`}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Open public page
                  </Link>
                ) : null}
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-4">
                  <p className="text-sm leading-7 text-slate-600">
                    {submission.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {submission.vibes.map((vibe) => (
                      <span
                        key={vibe}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {vibe}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <InfoRow label="Address" value={submission.address} />
                    <InfoRow label="Price" value={submission.priceRange} />
                    <InfoRow
                      label="Amenities"
                      value={submission.amenities.join(", ")}
                    />
                    <InfoRow label="Slug" value={submission.slug} />
                  </div>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Admin note
                    </span>
                    <textarea
                      value={note}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [submission.id]: event.target.value,
                        }))
                      }
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400"
                    />
                  </label>
                </div>

                <div className="rounded-[28px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Actions
                  </p>
                  <div className="mt-4 grid gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        reviewSubmission(
                          submission.id,
                          "approved",
                          note.trim() || undefined,
                        )
                      }
                      className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      Approve and publish
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        reviewSubmission(
                          submission.id,
                          "rejected",
                          note.trim() || undefined,
                        )
                      }
                      className="rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                    >
                      Reject submission
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        reviewSubmission(
                          submission.id,
                          "pending",
                          note.trim() || undefined,
                        )
                      }
                      className="rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                    >
                      Move back to pending
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
