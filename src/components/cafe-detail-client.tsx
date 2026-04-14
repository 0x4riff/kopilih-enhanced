"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { FavoriteButton } from "@/components/favorite-button";
import { formatPriceLabel } from "@/lib/utils";
import { coffeeShops } from "@/lib/data";
import type { CoffeeShop } from "@/lib/types";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function CafeDetailClient({ slug }: { slug: string }) {
  const [shop, setShop] = useState<CoffeeShop | null>(null);
  const [allShops, setAllShops] = useState<CoffeeShop[]>(coffeeShops);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCafe() {
      try {
        const { hasSupabaseEnv, getSupabaseBrowserClient } = await import("@/lib/supabase");
        const { mapCafeRowToCoffeeShop } = await import("@/lib/supabase-mappers");

        if (hasSupabaseEnv()) {
          const supabase = getSupabaseBrowserClient();
          const { data } = await supabase
            .from("cafes")
            .select("*")
            .eq("slug", slug)
            .eq("status", "published")
            .single();

          if (data) {
            setShop(mapCafeRowToCoffeeShop(data));

            const { data: allData } = await supabase
              .from("cafes")
              .select("*")
              .eq("status", "published")
              .order("featured", { ascending: false })
              .order("rating", { ascending: false });
            if (allData) {
              setAllShops(allData.map(mapCafeRowToCoffeeShop));
            }
          } else {
            const fallback = coffeeShops.find((s) => s.slug === slug) ?? null;
            setShop(fallback);
          }
        } else {
          const fallback = coffeeShops.find((s) => s.slug === slug) ?? null;
          setShop(fallback);
        }
      } catch {
        const fallback = coffeeShops.find((s) => s.slug === slug) ?? null;
        setShop(fallback);
      } finally {
        setLoading(false);
      }
    }

    loadCafe();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-[420px] animate-pulse rounded-[36px] bg-white/60" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-dashed border-slate-300 bg-white/70 p-10 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Listing unavailable</p>
          <h1 className="mt-3 font-display text-5xl text-slate-950">Cafe not found.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">
            This cafe may not be published yet, or was removed from the listing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Back to listing</Link>
            <Link href="/submit" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Submit another cafe</Link>
          </div>
        </div>
      </div>
    );
  }

  const related = allShops
    .filter((candidate) => candidate.slug !== shop.slug && candidate.city === shop.city)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section
        className="relative overflow-hidden rounded-[38px] border border-white/70 bg-slate-900 bg-cover bg-center text-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.65)]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.18), rgba(15,23,42,0.82)), url(${shop.imageUrl})`,
        }}
      >
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-10">
          <div className="space-y-6">
            <Link href="/" className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/15">
              Back to discover
            </Link>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{shop.city}</span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{shop.neighborhood}</span>
                {shop.source === "community" ? (
                  <span className="rounded-full bg-teal-500/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">Community approved</span>
                ) : null}
              </div>
              <div>
                <h1 className="font-display text-5xl leading-none sm:text-6xl">{shop.name}</h1>
                <p className="mt-3 max-w-2xl text-lg leading-8 text-white/80">{shop.longDescription}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <FavoriteButton slug={shop.slug} />
              <a href={shop.mapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">
                Open Maps
              </a>
              <a href={shop.instagramUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">
                Instagram
              </a>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">Snapshot</p>
            <dl className="mt-5 space-y-4 text-sm text-white/85">
              <DetailRow label="Rating" value={`${shop.rating.toFixed(1)} / 5`} />
              <DetailRow label="Reviews" value={`${shop.reviewCount} public reviews`} />
              <DetailRow label="Price" value={formatPriceLabel(shop.priceRange)} />
              <DetailRow label="WiFi" value={shop.wifiFriendly ? "Remote-work ready" : "Casual browsing"} />
              <DetailRow label="Address" value={shop.address} />
            </dl>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-8">
          <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vibes</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {shop.vibes.map((vibe) => (
                <span key={vibe} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{vibe}</span>
              ))}
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Amenities</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {shop.amenities.map((amenity) => (
                <span key={amenity} className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">{amenity}</span>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Opening hours</p>
            <div className="mt-4 grid gap-3">
              {shop.hours.map((row) => (
                <div key={row.day} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold">{row.day}</span>
                  <span>{row.open}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Nearby mood</p>
            <h2 className="mt-2 font-display text-3xl leading-none text-slate-950">More from {shop.city}</h2>
            <div className="mt-4 space-y-3">
              {related.length > 0 ? (
                related.map((candidate) => (
                  <Link key={candidate.slug} href={`/cafes/${candidate.slug}`} className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-amber-300 hover:bg-amber-50">
                    <div className="text-sm font-semibold text-slate-900">{candidate.name}</div>
                    <div className="text-xs text-slate-500">{candidate.neighborhood}</div>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-500">This is the only listed cafe from {shop.city} right now.</p>
              )}
            </div>
          </section>

          {shop.source === "community" ? (
            <section className="rounded-[32px] border border-teal-100 bg-teal-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Approval note</p>
              <h2 className="mt-2 font-display text-3xl leading-none text-slate-950">Community-approved listing</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">This cafe entered the catalog through the submit flow and was approved by an admin.</p>
            </section>
          ) : null}
        </aside>
      </section>
    </div>
  );
}