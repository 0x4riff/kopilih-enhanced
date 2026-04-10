import { coffeeShops, seededSubmissions } from "./data";
import type {
  CoffeeShop,
  CoffeeSubmission,
  DemoStoreState,
  ShopFilters,
  SubmissionInput,
  SubmissionStatus,
} from "./types";

const STORE_VERSION = 1;
const STORAGE_KEY = "kopilih:demo-store:v1";

export const defaultFilters: ShopFilters = {
  query: "",
  city: "all",
  vibe: "all",
  wifiOnly: false,
  price: "all",
  sort: "featured",
};

export function getInitialDemoState(): DemoStoreState {
  return {
    version: STORE_VERSION,
    favorites: [],
    submissions: seededSubmissions,
  };
}

function isBrowser() {
  return typeof window !== "undefined";
}

function isValidStore(value: unknown): value is DemoStoreState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DemoStoreState>;
  return candidate.version === STORE_VERSION && Array.isArray(candidate.favorites) && Array.isArray(candidate.submissions);
}

export function readDemoStore() {
  if (!isBrowser()) return getInitialDemoState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialDemoState();
    const parsed = JSON.parse(raw) as unknown;
    return isValidStore(parsed) ? parsed : getInitialDemoState();
  } catch {
    return getInitialDemoState();
  }
}

export function writeDemoStore(state: DemoStoreState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetDemoStore() {
  const next = getInitialDemoState();
  writeDemoStore(next);
  return next;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nextUniqueSlug(seed: string, submissions: CoffeeSubmission[]) {
  const base = slugify(seed) || "coffee-spot";
  const existing = new Set([
    ...coffeeShops.map((shop) => shop.slug),
    ...submissions.map((submission) => submission.slug),
  ]);

  if (!existing.has(base)) return base;
  let index = 2;
  while (existing.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

export function submissionToCoffeeShop(submission: CoffeeSubmission): CoffeeShop {
  return {
    id: `approved-${submission.id}`,
    slug: submission.slug,
    name: submission.name,
    city: submission.city,
    neighborhood: submission.neighborhood || submission.city,
    address: submission.address,
    description: submission.description,
    longDescription: `${submission.description} Listing ini muncul dari workflow submit user dan approval admin versi demo. Untuk production, data seperti validasi lokasi, foto, jam buka, dan audit trail approval sebaiknya dipindah ke database.`,
    priceRange: submission.priceRange,
    rating: 4.3,
    reviewCount: 37,
    vibes: submission.vibes,
    amenities: submission.amenities as CoffeeShop["amenities"],
    imageUrl:
      submission.imageUrl ||
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80",
    mapsUrl: submission.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(submission.name)}`,
    instagramUrl: submission.instagramUrl || "https://instagram.com",
    hours: [
      { day: "Senin - Jumat", open: "08.00 - 21.00" },
      { day: "Sabtu - Minggu", open: "08.00 - 22.00" },
    ],
    wifiFriendly: submission.amenities.includes("WiFi cepat"),
    featured: false,
    source: "community",
  };
}

export function getSeededPublicShops() {
  return [
    ...coffeeShops,
    ...seededSubmissions.filter((submission) => submission.status === "approved").map(submissionToCoffeeShop),
  ];
}

export function getPublicShops(submissions: CoffeeSubmission[]) {
  return [
    ...coffeeShops,
    ...submissions.filter((submission) => submission.status === "approved").map(submissionToCoffeeShop),
  ];
}

export function getApprovedShops() {
  return getPublicShops(getSubmissions());
}

export function getApprovedCoffeeShops() {
  return getApprovedShops();
}

export function findPublicShopBySlug(submissions: CoffeeSubmission[], slug: string) {
  return getPublicShops(submissions).find((shop) => shop.slug === slug);
}

export function findApprovedShopBySlug(slug: string) {
  return getApprovedShops().find((shop) => shop.slug === slug);
}

export function createSubmissionInState(state: DemoStoreState, input: SubmissionInput) {
  const submission: CoffeeSubmission = {
    ...input,
    id: `submission-${Date.now()}`,
    slug: nextUniqueSlug(`${input.name}-${input.city}`, state.submissions),
    submittedAt: new Date().toISOString(),
    status: "pending",
  };

  return {
    state: {
      ...state,
      submissions: [submission, ...state.submissions],
    },
    submission,
  };
}

export function reviewSubmissionInState(state: DemoStoreState, id: string, status: SubmissionStatus, adminNote?: string) {
  let updated: CoffeeSubmission | null = null;

  const submissions = state.submissions.map((submission) => {
    if (submission.id !== id) return submission;
    updated = { ...submission, status, adminNote };
    return updated;
  });

  return {
    state: { ...state, submissions },
    submission: updated,
  };
}

export function toggleFavoriteInState(state: DemoStoreState, slug: string) {
  const favorites = state.favorites.includes(slug)
    ? state.favorites.filter((item) => item !== slug)
    : [...state.favorites, slug];

  return { ...state, favorites };
}

export function countSubmissionsByStatus(submissions: CoffeeSubmission[]) {
  return submissions.reduce(
    (counts, submission) => {
      counts[submission.status] += 1;
      return counts;
    },
    { pending: 0, approved: 0, rejected: 0 },
  );
}

export function sortSubmissions(submissions: CoffeeSubmission[]) {
  const statusOrder: Record<SubmissionStatus, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
  };

  return [...submissions].sort((left, right) => {
    const byStatus = statusOrder[left.status] - statusOrder[right.status];
    if (byStatus !== 0) return byStatus;
    return new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime();
  });
}

export function getCityOptions(shops: CoffeeShop[]) {
  return Array.from(new Set(shops.map((shop) => shop.city))).sort((a, b) => a.localeCompare(b));
}

export function getVibeOptions(shops: CoffeeShop[]) {
  return Array.from(new Set(shops.flatMap((shop) => shop.vibes))).sort((a, b) => a.localeCompare(b));
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

export function getFavorites() {
  return readDemoStore().favorites;
}

export function toggleFavorite(slug: string) {
  const next = toggleFavoriteInState(readDemoStore(), slug);
  writeDemoStore(next);
  return next.favorites;
}

export function getSubmissions() {
  return readDemoStore().submissions;
}

export function saveSubmissions(submissions: CoffeeSubmission[]) {
  const current = readDemoStore();
  writeDemoStore({ ...current, submissions });
}

export function createSubmission(payload: SubmissionInput) {
  const next = createSubmissionInState(readDemoStore(), payload);
  writeDemoStore(next.state);
  return next.submission;
}

export function updateSubmissionStatus(id: string, status: SubmissionStatus, adminNote?: string) {
  const next = reviewSubmissionInState(readDemoStore(), id, status, adminNote);
  writeDemoStore(next.state);
  return next.submission;
}
