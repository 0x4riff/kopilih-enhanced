export type PriceRange = "$" | "$$" | "$$$";

export type Amenity =
  | "WiFi cepat"
  | "Colokan banyak"
  | "Outdoor"
  | "Indoor AC"
  | "Pet friendly"
  | "Meeting room"
  | "Parking"
  | "Brunch"
  | "Roastery";

export type CoffeeShop = {
  id: string;
  slug: string;
  name: string;
  city: string;
  neighborhood: string;
  address: string;
  description: string;
  longDescription: string;
  priceRange: PriceRange;
  rating: number;
  reviewCount: number;
  vibes: string[];
  amenities: Amenity[];
  imageUrl: string;
  mapsUrl: string;
  instagramUrl: string;
  hours: { day: string; open: string }[];
  featured?: boolean;
  wifiFriendly: boolean;
  source?: string;
};

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type CoffeeSubmission = {
  id: string;
  slug: string;
  name: string;
  city: string;
  neighborhood?: string;
  address: string;
  description: string;
  priceRange: PriceRange;
  vibes: string[];
  amenities: string[];
  imageUrl: string;
  mapsUrl: string;
  instagramUrl: string;
  submittedAt: string;
  status: SubmissionStatus;
  adminNote?: string;
};

export type SubmissionInput = Omit<CoffeeSubmission, "id" | "submittedAt" | "status">;

export type ShopSort = "featured" | "rating" | "price-low" | "name";

export type ShopFilters = {
  query: string;
  city: string;
  vibe: string;
  wifiOnly: boolean;
  price: string;
  sort: ShopSort;
};

export type DemoStoreState = {
  version: number;
  favorites: string[];
};

export type SupabaseCafeRow = {
  id: string;
  submission_id: string | null;
  name: string;
  slug: string;
  city: string;
  neighborhood: string | null;
  address: string;
  description: string;
  long_description: string | null;
  price_range: PriceRange;
  rating: number;
  review_count: number;
  vibes: string[];
  amenities: string[];
  image_url: string | null;
  maps_url: string | null;
  instagram_url: string | null;
  featured: boolean;
  wifi_friendly: boolean;
  source: string;
  status: string;
};

export type SupabaseSubmissionRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  neighborhood: string | null;
  address: string;
  description: string;
  price_range: PriceRange;
  vibes: string[];
  amenities: string[];
  image_url: string | null;
  maps_url: string | null;
  instagram_url: string | null;
  status: SubmissionStatus;
  admin_note: string | null;
  submitted_at?: string | null;
  created_at?: string | null;
};
