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
    <div className="stat-tile rounded-[28px] p-5">
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
                ? "Pilihan utama"
                : option === "rating"
                  ? "Rating tertinggi"
                  : option === "price-low"
                    ? "Harga terendah"
                    : option === "name"
                      ? "A-Z"
                      : option === "nearest"
                        ? "Terdekat dari kamu"
                        : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SidebarCard({ children, eyebrow, title }: { children: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <section className="surface-card rounded-[30px] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
      <h3 className="mt-2 text-3xl font-semibold leading-none text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function HomePageClient() {
  const [publicShops, setPublicShops] = useState<CoffeeShop[]>(getFallbackCoffeeShops());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState("");
  const [distanceRadiusKm, setDistanceRadiusKm] = useState<number | null>(null);
  const [filters, setFilters] = useState<ShopFilters>({ ...defaultFilters, sort: "featured" });
  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    setFavorites(getFavorites());

    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("kopilih:user-location");
      if (saved) {
        try {
          setUserLocation(JSON.parse(saved) as Coordinates);
        } catch {}
      }
    }

    async function loadCafes() {
      try {
        if (!hasSupabaseEnv()) {
          setPublicShops(getFallbackCoffeeShops());
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
        if (data?.length) setPublicShops(data.map(mapCafeRowToCoffeeShop));
      } catch {
        setPublicShops(getFallbackCoffeeShops());
      }
    }

    loadCafes();
  }, []);

  const effectiveFilters = { ...filters, query: deferredQuery };
  const cityOptions = useMemo(() => getCityOptions(publicShops), [publicShops]);
  const vibeOptions = useMemo(() => getVibeOptions(publicShops), [publicShops]);
  const filteredShops = useMemo(() => {
    const sorted = filterAndSortShops(publicShops, effectiveFilters, userLocation);
    if (!userLocation || !distanceRadiusKm) return sorted;
    return sorted.filter((shop) => shop.coordinates && calculateDistanceKm(userLocation, shop.coordinates) <= distanceRadiusKm);
  }, [publicShops, effectiveFilters, userLocation, distanceRadiusKm]);
  const favoriteShops = useMemo(() => publicShops.filter((shop) => favorites.includes(shop.slug)), [publicShops, favorites]);
  const nearestShop = useMemo(() => {
    if (!userLocation) return null;
    return filterAndSortShops(publicShops, { ...defaultFilters, sort: "nearest" }, userLocation)[0] ?? null;
  }, [publicShops, userLocation]);

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setLocationError("Browser ini belum mendukung akses lokasi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(nextLocation);
        window.localStorage.setItem("kopilih:user-location", JSON.stringify(nextLocation));
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
              <p className="editorial-kicker text-amber-200">KOPILIH</p>
              <h1 className="editorial-title max-w-4xl text-5xl font-semibold text-white sm:text-6xl lg:text-7xl">
                Dari kerja fokus sampai singgah santai, temukan cafe yang terasa tepat dan ingin kamu datangi lagi.
              </h1>
              <p className="editorial-body max-w-2xl text-base text-white/78 sm:text-lg">
                KOPILIH merangkum tempat dengan rasa ruang yang kuat, jarak yang masuk akal, dan karakter yang terasa sejak kunjungan pertama.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="btn btn-secondary px-6"
              >
Aktifkan lokasi saya
              </button>
              <Link
                href="/submit"
                className="btn btn-ghost px-6"
              >
Kirim rekomendasi cafe
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <span className="stat-tile rounded-full px-4 py-2">Kurasi kota-kota utama</span>
              <span className="stat-tile rounded-full px-4 py-2">Nearby browsing</span>
              <span className="stat-tile rounded-full px-4 py-2">Pilihan personal</span>
            </div>

            {locationError ? <p className="text-sm text-amber-100">{locationError}</p> : null}
            {nearestShop && userLocation ? (
              <p className="editorial-body max-w-xl text-sm text-white/80">
                Pilihan paling dekat saat ini adalah <span className="font-semibold text-white">{nearestShop.name}</span>
                {nearestShop.coordinates ? `, sekitar ${formatDistanceKm(calculateDistanceKm(userLocation, nearestShop.coordinates))} dari titikmu.` : "."}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <StatCard label="Cafe pilihan" value={String(publicShops.length)} />
            <StatCard label="Disimpan" value={String(favoriteShops.length)} />
            <StatCard label="Kota aktif" value={String(cityOptions.length)} />
            <StatCard label="Paling dekat" value={nearestShop ? nearestShop.city : "-"} />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6" id="discover">
          <div className="surface-card rounded-[32px] p-5 sm:p-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Cari</span>
                <input
                  value={filters.query}
                  onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                  placeholder="Nama cafe, kota, atau vibe"
                  className="w-full rounded-[22px] border border-slate-200/90 bg-white/88 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] outline-none backdrop-blur transition focus:border-slate-400 focus:bg-white focus:shadow-[0_18px_38px_-28px_rgba(15,23,42,0.4)]"
                />
              </label>

              <SelectField label="Kota" value={filters.city} onChange={(value) => setFilters((current) => ({ ...current, city: value }))} options={["all", ...cityOptions]} />
              <SelectField label="Vibe" value={filters.vibe} onChange={(value) => setFilters((current) => ({ ...current, vibe: value }))} options={["all", ...vibeOptions]} />
              <SelectField label="Harga" value={filters.price} onChange={(value) => setFilters((current) => ({ ...current, price: value }))} options={["all", "$", "$$", "$$$"]} />
              <SelectField label="Urutkan" value={filters.sort} onChange={(value) => setFilters((current) => ({ ...current, sort: value as typeof current.sort }))} options={["featured", "rating", "price-low", "name", ...(userLocation ? ["nearest"] : [])]} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="surface-muted inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={filters.wifiOnly}
                    onChange={(event) => setFilters((current) => ({ ...current, wifiOnly: event.target.checked }))}
                    className="size-4 rounded border-slate-300 text-amber-500"
                  />
Prioritaskan WiFi
                </label>
                {userLocation ? (
                  <div className="flex flex-wrap gap-2">
                    {[5, 10].map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setDistanceRadiusKm((current) => (current === radius ? null : radius))}
                        className={`chip ${distanceRadiusKm === radius ? "chip-active" : ""}`}
                      >
                        Dalam {radius} km
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => {
                  setFilters({ ...defaultFilters, sort: userLocation ? "nearest" : "featured" });
                  setDistanceRadiusKm(null);
                }}
                className="btn btn-secondary !min-h-0 px-4 py-2.5"
              >
                Reset filters
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Pilihan saat ini</p>
              <h2 className="editorial-title text-4xl font-semibold text-slate-950">{filteredShops.length} cafe siap dipertimbangkan</h2>
            </div>
            <p className="editorial-body max-w-md text-sm text-slate-600">
              Mulai dari pilihan unggulan, lalu sempitkan berdasarkan vibe, harga, atau radius dari titikmu sekarang.
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
            <div className="surface-card rounded-[30px] border-dashed border-slate-300 p-8 text-center text-slate-500">
              <p className="editorial-kicker text-slate-400">Belum ketemu yang pas</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-950">Coba longgarkan filter, lalu lihat pilihan yang muncul.</h3>
              <p className="editorial-body mx-auto mt-3 max-w-md text-sm text-slate-500">Kadang radius terlalu sempit, vibe terlalu spesifik, atau harga terlalu ketat untuk area yang sedang kamu lihat.</p>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <SidebarCard eyebrow="Terdekat darimu" title={nearestShop ? nearestShop.name : "Lokasi belum aktif"}>
            {nearestShop && userLocation ? (
              <div className="space-y-2 text-sm text-slate-600">
                <p>{nearestShop.neighborhood}, {nearestShop.city}</p>
                <p>{nearestShop.address}</p>
                {nearestShop.coordinates ? <p>{formatDistanceKm(calculateDistanceKm(userLocation, nearestShop.coordinates))} dari titikmu</p> : null}
                <div className="flex flex-wrap gap-3">
                  <Link href={`/cafes/${nearestShop.slug}`} className="btn btn-primary !min-h-0 px-4 py-2.5">
                    Lihat cafe
                  </Link>
                  <a href={nearestShop.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary !min-h-0 px-4 py-2.5">
                    Buka rute
                  </a>
                </div>
              </div>
            ) : (
              <p className="editorial-body text-sm text-slate-500">Aktifkan lokasi untuk melihat cafe yang paling relevan dengan jarak tempuhmu saat ini.</p>
            )}
          </SidebarCard>

          <SidebarCard eyebrow="Tersimpan" title={favoriteShops.length > 0 ? `${favoriteShops.length} cafe kamu tandai` : "Belum ada yang disimpan"}>
            {favoriteShops.length > 0 ? (
              <div className="space-y-3">
                {favoriteShops.slice(0, 4).map((shop) => (
                  <Link key={shop.slug} href={`/cafes/${shop.slug}`} className="surface-muted block rounded-[24px] px-4 py-3.5 transition hover:border-slate-300 hover:bg-white/95">
                    <div className="text-sm font-semibold text-slate-900">{shop.name}</div>
                    <div className="text-xs text-slate-500">{shop.neighborhood}, {shop.city}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="editorial-body text-sm text-slate-500">Gunakan tombol Simpan di tiap card untuk membangun shortlist cafe yang ingin kamu kunjungi lagi.</p>
            )}
          </SidebarCard>
        </aside>
      </section>
    </div>
  );
}
