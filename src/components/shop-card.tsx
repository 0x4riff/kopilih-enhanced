import Link from "next/link";

import { FavoriteButton } from "@/components/favorite-button";
import type { CoffeeShop, Coordinates } from "@/lib/types";
import { calculateDistanceKm, formatDistanceKm, formatPriceLabel } from "@/lib/utils";

export function ShopCard({ shop, userLocation }: { shop: CoffeeShop; userLocation?: Coordinates | null }) {
  const distance = userLocation && shop.coordinates ? calculateDistanceKm(userLocation, shop.coordinates) : null;
  return (
    <article className="overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_25px_70px_-40px_rgba(15,23,42,0.45)]">
      <div
        className="relative h-60 bg-slate-200 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.56)), url(${shop.imageUrl})`,
        }}
      >
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
            {shop.city}
          </span>
          <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">
            {shop.priceRange}
          </span>
          {shop.source === "community" ? (
            <span className="rounded-full bg-teal-500/85 px-3 py-1 text-xs font-semibold text-white">
              Community approved
            </span>
          ) : null}
          {distance !== null ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
              {formatDistanceKm(distance)} away
            </span>
          ) : null}
        </div>

        <div className="absolute right-4 top-4">
          <FavoriteButton slug={shop.slug} />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
            {shop.neighborhood}
          </p>
          <h3 className="font-display text-3xl leading-none">{shop.name}</h3>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm leading-6 text-slate-600">{shop.description}</p>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-right text-sm text-amber-900 shadow-sm">
            <div className="font-semibold">{shop.rating.toFixed(1)}</div>
            <div>{shop.reviewCount} reviews</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {shop.vibes.slice(0, 3).map((vibe) => (
            <span
              key={vibe}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {vibe}
            </span>
          ))}
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
            {formatPriceLabel(shop.priceRange)}
          </span>
          {distance !== null && distance < 5 ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Near you
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500">
            {shop.amenities.slice(0, 3).join(" • ")}
          </span>
          <Link
            href={`/cafes/${shop.slug}`}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            View detail
          </Link>
        </div>
      </div>
    </article>
  );
}
