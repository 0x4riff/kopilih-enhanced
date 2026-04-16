import type { CoffeeShop, Coordinates, PriceRange, ShopFilters, SubmissionStatus } from "./types";

export function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatPriceLabel(priceRange: PriceRange) {
  switch (priceRange) {
    case "$":
      return "Budget friendly";
    case "$$":
      return "Mid range";
    case "$$$":
      return "Treat spot";
    default:
      return priceRange;
  }
}

export function formatStatusLabel(status: SubmissionStatus) {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "pending":
    default:
      return "Pending review";
  }
}

export function statusTone(status: SubmissionStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-rose-100 text-rose-700";
    case "pending":
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export function calculateDistanceKm(a: Coordinates, b: Coordinates) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return earthRadiusKm * c;
}

export function formatDistanceKm(distanceKm: number) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}

export function filterAndSortShops(shops: CoffeeShop[], filters: ShopFilters, userLocation?: Coordinates | null) {
  const query = filters.query.trim().toLowerCase();

  const filtered = shops.filter((shop) => {
    const haystack = [shop.name, shop.city, shop.neighborhood, shop.description, ...shop.vibes].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesCity = !filters.city || filters.city === "all" || shop.city === filters.city;
    const matchesVibe = !filters.vibe || filters.vibe === "all" || shop.vibes.includes(filters.vibe);
    const matchesWifi = !filters.wifiOnly || shop.wifiFriendly;
    const matchesPrice = !filters.price || filters.price === "all" || shop.priceRange === filters.price;

    return matchesQuery && matchesCity && matchesVibe && matchesWifi && matchesPrice;
  });

  return filtered.sort((a, b) => {
    switch (filters.sort) {
      case "nearest": {
        if (!userLocation) return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.rating - a.rating;
        const aDistance = a.coordinates ? calculateDistanceKm(userLocation, a.coordinates) : Number.POSITIVE_INFINITY;
        const bDistance = b.coordinates ? calculateDistanceKm(userLocation, b.coordinates) : Number.POSITIVE_INFINITY;
        return aDistance - bDistance;
      }
      case "rating":
        return b.rating - a.rating;
      case "price-low":
        return a.priceRange.length - b.priceRange.length;
      case "name":
        return a.name.localeCompare(b.name, "id");
      case "featured":
      default:
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.rating - a.rating;
    }
  });
}

export function getShopStats(shops: CoffeeShop[]) {
  const total = shops.length;
  const cities = new Set(shops.map((shop) => shop.city)).size;
  const wifiFriendly = shops.filter((shop) => shop.wifiFriendly).length;
  const averageRating = total ? (shops.reduce((sum, shop) => sum + shop.rating, 0) / total).toFixed(1) : "0.0";

  return {
    total,
    cities,
    wifiFriendly,
    averageRating,
  };
}
