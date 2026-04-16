"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ShopCard } from "@/components/shop-card";
import { defaultFilters, getCityOptions, getFavorites, getVibeOptions } from "@/lib/demo-store";
import { getFallbackCoffeeShops, mapCafeRowToCoffeeShop } from "@/lib/supabase-mappers";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import type { CoffeeShop, Coordinates, ShopFilters } from "@/lib/types";
import { calculateDistanceKm, filterAndSortShops, formatDistanceKm } from "@/lib/utils";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">{label}</div>
      <div className="mt-3 text-4xl font-semibold leading-none text-white">{value}</div>
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
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
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
                      : option === "nearest"
                        ? "Nearest to you"
                        : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SidebarCard({ children, eyebrow, title }: { children: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <section className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
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
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState("");
  const [filters, setFilters] = useState<ShopFilters>({ ...defaultFilters, sort: "featured" });
  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    setFavorites(getFavorites());

    async function loadCafes() {
      try {
        if (!hasSupabaseEnv()) {
          setPublicShops(getFallbackCoffeeShops());
          setUsingSupabase(false);
          return;
        }

        const supabase = getSupabaseBrowserClient() as any;
        const { data, error } = await supabase
          .from("cafes")
          .select("*")
          .eq("status", "published")
          .order("featured", { ascending: false })
          .order("rating", { ascending: false });

        if (error) throw error;

        if (data?.length) {
          setPublicShops(data.map(mapCafeRowToCoffeeShop));
          setUsingSupabase(true);
        } else {
          setPublicShops(getFallbackCoffeeShops());
          setUsingSupabase(false);
        }
      } catch (error) {
        console.error("Failed to load cafes", error);
        setPublicShops(getFallbackCoffeeShops());
        setUsingSupabase(false);
      } finally {
        setLoading(false);
      }
    }

    loadCafes();
  }, []);

  const effectiveFilters = { ...filters, query: deferredQuery };
  const cityOptions = useMemo(() => getCityOptions(publicShops), [publicShops]);
  const vibeOptions = useMemo(() => getVibeOptions(publicShops), [publicShops]);
  const filteredShops = useMemo(() => filterAndSortShops(publicShops, effectiveFilters, userLocation), [publicShops, effectiveFilters, userLocation]);
  const favoriteShops = useMemo(() => publicShops.filter((shop) => favorites.includes(shop.slug)), [publicShops, favorites]);
  const communityShops = useMemo(() => publicShops.filter((shop) => shop.source === "community"), [publicShops]);
  const nearestShop = useMemo(() => {
    if (!userLocation) return null;
    return filterAndSortShops(publicShops, { ...defaultFilters, sort: "nearest" }, userLocation)[0] ?? null;
  }, [publicShops, userLocation]);

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setLocationError("Browser ini belum support geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationError("");
        setFilters((current) => ({ ...current, sort: "nearest" }));
      },
      () => setLocationError("Lokasi belum bisa diambil. Pastikan izin lokasi aktif."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[40px] border border-[#4b382d] bg-[linear-gradient(135deg,#111827_0%,#2b211d_45%,#8b4a13_100%)] p-6 text-white shadow-[0_40px_120px_-55px_rgba(15,23,42,0.75)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_300px] lg:items-end">
          <div className="space-y-7">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-200">KOPILIH</p>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] text-white sm:text-6xl lg:text-7xl">
                Temukan cafe terbaik yang paling pas, dan paling dekat.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                Kurasi cafe Indonesia untuk kerja, meeting santai, deep focus, atau sekadar menikmati suasana, sekarang dengan mode lokasi terdekat.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                Use my location
              </button>
              <Link
                href="/submit"
                className="inline-flex items-center rounded-full border border-white/35 bg-black/10 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                Submit a new cafe
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">Near me sorting</span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">Curated feel</span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">Community submissions</span>
            </div>

            {locationError ? <p className="text-sm text-amber-100">{locationError}</p> : null}
            {nearestShop && userLocation ? (
              <p className="text-sm text-white/80">
                Nearest right now: <span className="font-semibold text-white">{nearestShop.name}</span> · {nearestShop.coordinates ? formatDistanceKm(calculateDistanceKm(userLocation, nearestShop.coordinates)) : "Unknown distance"}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <StatCard label="Public cafes" value={String(publicShops.length)} />
            <StatCard label="Community picks" value={String(communityShops.length)} />
            <StatCard label="Saved by you" value={String(favoriteShops.length)} />
            <StatCard label={loading ? "Loading source" : usingSupabase ? "Live source" : "Fallback source"} value={loading ? "..." : usingSupabase ? "SUPABASE" : "CURATED"} />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6" id="discover">
          <div className="rounded-[32px] border border-white/80 bg-white/90 p-5 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.25)] backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Search</span>
                <input
                  value={filters.query}
                  onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                  placeholder="Cafe, city, vibe"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </label>

              <SelectField label="City" value={filters.city} onChange={(value) => setFilters((current) => ({ ...current, city: value }))} options={["all", ...cityOptions]} />
              <SelectField label="Vibe" value={filters.vibe} onChange={(value) => setFilters((current) => ({ ...current, vibe: value }))} options={["all", ...vibeOptions]} />
              <SelectField label="Price" value={filters.price} onChange={(value) => setFilters((current) => ({ ...current, price: value }))} options={["all", "$", "$$", "$$$"]} />
              <SelectField label="Sort" value={filters.sort} onChange={(value) => setFilters((current) => ({ ...current, sort: value as typeof current.sort }))} options={["featured", "rating", "price-low", "name", ...(userLocation ? ["nearest"] : [])]} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={filters.wifiOnly}
                  onChange={(event) => setFilters((current) => ({ ...current, wifiOnly: event.target.checked }))}
                  className="size-4 rounded border-slate-300 text-amber-500"
                />
                WiFi first
              </label>

              <button
                type="button"
                onClick={() => setFilters({ ...defaultFilters, sort: userLocation ? "nearest" : "featured" })}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Reset filters
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Approved listing</p>
              <h2 className="text-4xl font-semibold leading-none text-slate-950">{filteredShops.length} cafes ready to browse</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              {usingSupabase
                ? "Data sekarang diambil dari katalog live Supabase. Sorting nearest aktif saat izin lokasi diberikan."
                : "Saat koneksi live belum terbaca, halaman tetap menampilkan katalog kurasi agar pengalaman browsing tidak kosong."}
            </p>
          </div>

          {filteredShops.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {filteredShops.map((shop) => (
                <div key={shop.slug}>
                  <ShopCard shop={shop} userLocation={userLocation} />
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
          <SidebarCard eyebrow="Nearest to you" title={nearestShop ? nearestShop.name : "Location not active"}>
            {nearestShop && userLocation ? (
              <div className="space-y-2 text-sm text-slate-600">
                <p>{nearestShop.neighborhood}, {nearestShop.city}</p>
                <p>{nearestShop.address}</p>
                {nearestShop.coordinates ? <p>{formatDistanceKm(calculateDistanceKm(userLocation, nearestShop.coordinates))} dari titikmu</p> : null}
                <Link href={`/cafes/${nearestShop.slug}`} className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  Open nearest cafe
                </Link>
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-500">Aktifkan lokasi untuk melihat cafe paling dekat dari titikmu sekarang.</p>
            )}
          </SidebarCard>

          <SidebarCard eyebrow="Your favorites" title={favoriteShops.length > 0 ? `${favoriteShops.length} cafe${favoriteShops.length > 1 ? "s" : ""} saved` : "Nothing saved yet"}>
            {favoriteShops.length > 0 ? (
              <div className="space-y-3">
                {favoriteShops.slice(0, 4).map((shop) => (
                  <Link key={shop.slug} href={`/cafes/${shop.slug}`} className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition hover:border-amber-300 hover:bg-amber-50">
                    <div className="text-sm font-semibold text-slate-900">{shop.name}</div>
                    <div className="text-xs text-slate-500">{shop.neighborhood}, {shop.city}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-500">Use Save pada card cafe untuk menyimpan shortlist personal di browser ini.</p>
            )}
          </SidebarCard>
        </aside>
      </section>
    </div>
  );
}
