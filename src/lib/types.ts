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

export type ShopSource = "editorial" | "community";

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
  source: ShopSource;
};

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type CoffeeSubmission = {
  id: string;
  slug: string;
  name: string;
  city: string;
  neighborhood: string;
  address: string;
  description: string;
  priceRange: PriceRange;
  vibes: string[];
  amenities: Amenity[];
  imageUrl: string;
  mapsUrl: string;
  instagramUrl: string;
  submittedAt: string;
  status: SubmissionStatus;
  adminNote?: string;
};

export type SubmissionInput = Omit<
  CoffeeSubmission,
  "id" | "slug" | "submittedAt" | "status" | "adminNote"
>;

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
  submissions: CoffeeSubmission[];
};
