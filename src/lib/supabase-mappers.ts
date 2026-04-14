import { coffeeShops } from "./data";
import type {
  CoffeeShop,
  CoffeeSubmission,
  SupabaseCafeRow,
  SupabaseSubmissionRow,
} from "./types";

const fallbackImage =
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80";

export function mapCafeRowToCoffeeShop(row: SupabaseCafeRow): CoffeeShop {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    neighborhood: row.neighborhood || row.city,
    address: row.address,
    description: row.description,
    longDescription:
      row.long_description ||
      `${row.description} Listing ini diambil dari database Supabase untuk workflow production-ready Kopilih.`,
    priceRange: row.price_range,
    rating: Number(row.rating ?? 4.5),
    reviewCount: Number(row.review_count ?? 0),
    vibes: row.vibes || [],
    amenities: (row.amenities || []) as CoffeeShop["amenities"],
    imageUrl: row.image_url || fallbackImage,
    mapsUrl: row.maps_url || `https://maps.google.com/?q=${encodeURIComponent(row.name)}`,
    instagramUrl: row.instagram_url || "https://instagram.com",
    hours: [{ day: "Jam buka", open: "Lihat detail selanjutnya" }],
    featured: row.featured,
    wifiFriendly: row.wifi_friendly,
    source: row.source,
  };
}

export function mapSubmissionRowToSubmission(row: SupabaseSubmissionRow): CoffeeSubmission {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    neighborhood: row.neighborhood || undefined,
    address: row.address,
    description: row.description,
    priceRange: row.price_range,
    vibes: row.vibes || [],
    amenities: row.amenities || [],
    imageUrl: row.image_url || "",
    mapsUrl: row.maps_url || "",
    instagramUrl: row.instagram_url || "",
    submittedAt: row.submitted_at || row.created_at || new Date().toISOString(),
    status: row.status,
    adminNote: row.admin_note || undefined,
  };
}

export function getFallbackCoffeeShops() {
  return coffeeShops;
}
