import type { CoffeeShop, ShopFilters, DemoStoreState } from "./types";

const STORE_VERSION = 2;
const STORAGE_KEY = "kopilih:favorites:v2";

export const defaultFilters: ShopFilters = {
  query: "",
  city: "all",
  vibe: "all",
  wifiOnly: false,
  price: "all",
  sort: "featured",
};

export function getInitialDemoState() {
  return {
    version: STORE_VERSION,
    favorites: [] as string[],
  };
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function readFavoritesFromStorage(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return [];
    const candidate = parsed as Partial<{ version: number; favorites: unknown }>;
    if (candidate.version !== STORE_VERSION || !Array.isArray(candidate.favorites)) return [];
    return candidate.favorites.filter((f): f is string => typeof f === "string");
  } catch {
    return [];
  }
}

export function writeFavoritesToStorage(favorites: string[]) {
  if (!isBrowser()) return;
  const state: DemoStoreState = { version: STORE_VERSION, favorites };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getFavorites(): string[] {
  return readFavoritesFromStorage();
}

export function toggleFavorite(slug: string): string[] {
  const current = readFavoritesFromStorage();
  const next = current.includes(slug)
    ? current.filter((f) => f !== slug)
    : [...current, slug];
  writeFavoritesToStorage(next);
  return next;
}

export function getCityOptions(shops: CoffeeShop[]) {
  return Array.from(new Set(shops.map((shop) => shop.city))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getVibeOptions(shops: CoffeeShop[]) {
  return Array.from(new Set(shops.flatMap((shop) => shop.vibes))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function filterShops(shops: CoffeeShop[], filters: ShopFilters) {
  const query = filters.query.trim().toLowerCase();
  const filtered = shops.filter((shop) => {
    const haystack = [shop.name, shop.city, shop.neighborhood, shop.description, ...shop.vibes].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesCity = filters.city === "all" || shop.city === filters.city;
    const matchesVibe = filters.vibe === "all" || shop.vibes.includes(filters.vibe);
    const matchesWifi = !filters.wifiOnly || shop.wifiFriendly;
    const matchesPrice = filters.price === "all" || shop.priceRange === filters.price;
    return matchesQuery && matchesCity && matchesVibe && matchesWifi && matchesPrice;
  });

  return filtered.sort((left, right) => {
    switch (filters.sort) {
      case "rating":
        return right.rating - left.rating;
      case "price-low":
        return left.priceRange.length - right.priceRange.length;
      case "name":
        return left.name.localeCompare(right.name, "id");
      case "featured":
      default:
        return Number(Boolean(right.featured)) - Number(Boolean(left.featured)) || right.rating - left.rating;
    }
  });
}