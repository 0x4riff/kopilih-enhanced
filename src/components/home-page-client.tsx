"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ShopCard } from "@/components/shop-card";
import { defaultFilters, filterShops, getCityOptions, getFavorites, getVibeOptions, toggleFavorite } from "@/lib/demo-store";
import { getFallbackCoffeeShops, mapCafeRowToCoffeeShop } from "@/lib/supabase-mappers";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import type { CoffeeShop } from "@/lib/types";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="text-sm text-white/75">{label}</div>
      <div className="mt-1 text-4xl font-semibold leading-none text-white">{value}</div>
    </div>
  );
}

function SelectField({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value: string }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all"
              ? `All ${label.toLowerCase()}s`
              : option === "featured"
                ? "Featured first"
                : option === "rating"
                  ? "Top rating"
                  : option === "price-low"
                    ? "Lowest price"
                    : option === "name"
                      ? "Alphabetical"
                      : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SidebarCard({ children, eyebrow, title }: { children: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <section className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
      <h3 className="mt-2 text-3xl font-semibold leading-none text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function HomePageClient() {
  const [publicShops, setPublicShops] = useState<CoffeeShop[]>(getFallbackCoffeeShops());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    setFavorites(getFavorites());

    async function loadCafes() {
      if (!hasSupabaseEnv()) {
        setPublicShops(getFallbackCoffeeShops());
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("cafes")
          .select("*")
          .eq("status", "published")
          .order("featured", { ascending: false })
          .order("rating", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setPublicShops(data.map(mapCafeRowToCoffeeShop));
          setUsingSupabase(true);
        } else {
          setPublicShops(getFallbackCoffeeShops());
        }
      } catch {
        setPublicShops(getFallbackCoffeeShops());
      } finally {
        setLoading(false);
      }
    }

    loadCafes();
  }, []);

  const effectiveFilters = { ...filters, query: deferredQuery };
  const cityOptions = useMemo(() => getCityOptions(publicShops), [publicShops]);
  const vibeOptions = useMemo(() => getVibeOptions(publicShops), [publicShops]);
  const filteredShops = useMemo(() => filterShops(publicShops, effectiveFilters), [publicShops, effectiveFilters]);
  const favoriteShops = useMemo(() => publicShops.filter((shop) => favorites.includes(shop.slug)), [publicShops, favorites]);
  const communityShops = useMemo(() => publicShops.filter((shop) => shop.source === "community"), [publicShops]);

  const counts = {
    pending: 0,
    approved: communityShops.length,
    rejected: 0,
  };

  function handleFavoriteToggle(slug: string) {
    setFavorites(toggleFavorite(slug));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#1f2937_0%,#3b2f2f_38%,#d97706_100%)] p-6 text-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.6)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-end">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200/90">Kopilih Enhanced</p>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold leading-none sm:text-6xl">Temukan cafe yang enak dipakai hidup, kerja, dan balik lagi.</h1>
              <p className="max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                Discovery app untuk cafe Indonesia, sekarang siap naik level dari demo ke backend Supabase.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#discover" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-50">
                Explore cafes
              </a>
              <Link href="/submit" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Submit a new cafe
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <StatCard label="Public cafes" value={String(publicShops.length)} />
            <StatCard label="Community picks" value={String(communityShops.length)} />
            <StatCard label="Saved by you" value={String(favoriteShops.length)} />
            <StatCard label={usingSupabase ? "Supabase mode" : "Demo mode"} value={loading ? "..." : usingSupabase ? "ON" : "LOCAL"} />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6" id="discover">
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Search</span>
                <input
                  value={filters.query}
                  onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                  placeholder="Cafe, city, vibe"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400"
                />
              </label>

              <SelectField label="City" value={filters.city} onChange={(value) => setFilters((current) => ({ ...current, city: value }))} options={["all", ...cityOptions]} />
              <SelectField label="Vibe" value={filters.vibe} onChange={(value) => setFilters((current) => ({ ...current, vibe: value }))} options={["all", ...vibeOptions]} />
              <SelectField label="Price" value={filters.price} onChange={(value) => setFilters((current) => ({ ...current, price: value }))} options={["all", "$", "$$", "$$$"]} />
              <SelectField label="Sort" value={filters.sort} onChange={(value) => setFilters((current) => ({ ...current, sort: value as typeof current.sort }))} options={["featured", "rating", "price-low", "name"]} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.wifiOnly}
                  onChange={(event) => setFilters((current) => ({ ...current, wifiOnly: event.target.checked }))}
                  className="size-4 rounded border-slate-300 text-amber-500"
                />
                WiFi first
              </label>

              <button type="button" onClick={() => setFilters(defaultFilters)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                Reset filters
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Approved listing</p>
              <h2 className="text-4xl font-semibold leading-none text-slate-950">{filteredShops.length} cafes ready to browse</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              {usingSupabase ? "Data sekarang diambil dari Supabase published cafes." : "Masih fallback ke seeded demo data lokal sampai env Supabase dipasang."}
            </p>
          </div>

          {filteredShops.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {filteredShops.map((shop) => (
                <div key={shop.slug} onClick={() => undefined}>
                  <ShopCard shop={shop} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
              No cafes match this filter set. Try widening the city, vibe, or price filters.
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <SidebarCard eyebrow="Your favorites" title={favoriteShops.length > 0 ? `${favoriteShops.length} cafe${favoriteShops.length > 1 ? "s" : ""} saved` : "Nothing saved yet"}>
            {favoriteShops.length > 0 ? (
              <div className="space-y-3">
                {favoriteShops.slice(0, 4).map((shop) => (
                  <Link key={shop.slug} href={`/cafes/${shop.slug}`} className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-amber-300 hover:bg-amber-50">
                    <div className="text-sm font-semibold text-slate-900">{shop.name}</div>
                    <div className="text-xs text-slate-500">{shop.neighborhood}, {shop.city}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-500">Use the Save button on any card to keep a shortlist in localStorage for this browser.</p>
            )}
          </SidebarCard>

          <SidebarCard eyebrow="Community picks" title={`${communityShops.length} approved submission${communityShops.length > 1 ? "s" : ""}`}>
            {communityShops.length > 0 ? (
              <div className="space-y-3">
                {communityShops.slice(0, 3).map((shop) => (
                  <Link key={shop.slug} href={`/cafes/${shop.slug}`} className="block rounded-2xl bg-teal-50 px-4 py-3 transition hover:bg-teal-100">
                    <div className="text-sm font-semibold text-slate-900">{shop.name}</div>
                    <div className="text-xs text-slate-600">{shop.city}, community approved</div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-500">Approved submissions will show up here after moderation.</p>
            )}
          </SidebarCard>

          <SidebarCard eyebrow="Status" title="Transition to Supabase">
            <p className="text-sm leading-6 text-slate-500">
              Submit and admin review flow akan diarahkan ke database. Favorites tetap aman disimpan lokal di browser.
            </p>
            <div className="mt-4 flex gap-3">
              <Link href="/submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                Submit flow
              </Link>
              <Link href="/admin/submissions" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Open admin
              </Link>
            </div>
          </SidebarCard>
        </aside>
      </section>
    </div>
  );
}
