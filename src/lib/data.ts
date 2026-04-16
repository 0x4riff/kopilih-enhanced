import type {
  Amenity,
  CoffeeShop,
  CoffeeSubmission,
  PriceRange,
} from "./types";

export const amenityOptions: Amenity[] = [
  "WiFi cepat",
  "Colokan banyak",
  "Outdoor",
  "Indoor AC",
  "Pet friendly",
  "Meeting room",
  "Parking",
  "Brunch",
  "Roastery",
];

export const priceRangeOptions: PriceRange[] = ["$", "$$", "$$$"];

export const coffeeShops: CoffeeShop[] = [
  {
    id: "seed-1",
    slug: "seperempat-lab-jakarta",
    name: "Seperempat Lab",
    city: "Jakarta",
    neighborhood: "Kebayoran Baru",
    address: "Jl. Wijaya I No.63, Jakarta Selatan",
    description:
      "Coffee bar terang dengan espresso clean, meja kerja nyaman, dan crowd produktif.",
    longDescription:
      "Seperempat Lab cocok untuk sesi fokus di siang hari lalu lanjut santai sore. Ada banyak colokan, kursi ergonomis, dan menu kopi susu sampai manual brew yang konsisten.",
    priceRange: "$$",
    rating: 4.8,
    reviewCount: 412,
    vibes: ["Work-friendly", "Minimal", "Specialty coffee"],
    amenities: [
      "WiFi cepat",
      "Colokan banyak",
      "Indoor AC",
      "Parking",
      "Brunch",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
    mapsUrl: "https://maps.google.com/?q=Seperempat+Lab+Jakarta",
    instagramUrl: "https://instagram.com/seperempatcoffee",
    hours: [
      { day: "Senin - Jumat", open: "07.00 - 22.00" },
      { day: "Sabtu - Minggu", open: "08.00 - 23.00" },
    ],
    featured: true,
    wifiFriendly: true,
    source: "editorial",
    coordinates: { lat: -6.244669, lng: 106.814298 },
  },
  {
    id: "seed-2",
    slug: "titik-temu-bali-seminyak",
    name: "Titik Temu Bali",
    city: "Bali",
    neighborhood: "Seminyak",
    address: "Jl. Kayu Aya No.40, Seminyak",
    description:
      "Hidden gem tropis untuk brunch, meeting santai, dan nongkrong setelah pantai.",
    longDescription:
      "Titik Temu punya outdoor yang adem, pastry solid, dan ambience yang cocok untuk catch-up atau kerja ringan. Crowd internasional bikin tempat ini terasa hidup sepanjang hari.",
    priceRange: "$$$",
    rating: 4.7,
    reviewCount: 356,
    vibes: ["Tropical", "Brunch", "Social"],
    amenities: ["WiFi cepat", "Outdoor", "Parking", "Brunch", "Pet friendly"],
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    mapsUrl: "https://maps.google.com/?q=Titik+Temu+Bali+Seminyak",
    instagramUrl: "https://instagram.com/titiktemucoffee",
    hours: [{ day: "Setiap hari", open: "07.30 - 22.00" }],
    featured: true,
    wifiFriendly: true,
    source: "editorial",
    coordinates: { lat: -8.685657, lng: 115.167457 },
  },
  {
    id: "seed-3",
    slug: "jiwa-hub-dago-bandung",
    name: "Jiwa Hub Dago",
    city: "Bandung",
    neighborhood: "Dago",
    address: "Jl. Ir. H. Juanda No.111, Bandung",
    description:
      "Spot casual dengan rooftop city view, ideal untuk meetup kecil dan golden hour.",
    longDescription:
      "Jiwa Hub Dago punya area indoor dan semi outdoor yang luas. Menunya ramah budget, cocok buat mahasiswa dan pekerja remote yang cari tempat ramai tapi tetap nyaman.",
    priceRange: "$",
    rating: 4.5,
    reviewCount: 287,
    vibes: ["Casual", "Sunset", "Community"],
    amenities: ["WiFi cepat", "Outdoor", "Indoor AC", "Parking"],
    imageUrl:
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1200&q=80",
    mapsUrl: "https://maps.google.com/?q=Jiwa+Hub+Dago+Bandung",
    instagramUrl: "https://instagram.com/jiwahub",
    hours: [
      { day: "Senin - Kamis", open: "09.00 - 22.00" },
      { day: "Jumat - Minggu", open: "09.00 - 23.00" },
    ],
    wifiFriendly: true,
    source: "editorial",
    coordinates: { lat: -6.889836, lng: 107.613144 },
  },
  {
    id: "seed-4",
    slug: "noor-kopi-yogyakarta",
    name: "Noor Kopi",
    city: "Yogyakarta",
    neighborhood: "Prawirotaman",
    address: "Jl. Prawirotaman No.28, Yogyakarta",
    description:
      "Cafe artsy dengan manual brew, playlist hangat, dan ruang ngobrol yang intimate.",
    longDescription:
      "Noor Kopi jadi favorit untuk slow morning dan malam yang tenang. Cocok buat penikmat kopi filter, traveler, atau siapa pun yang ingin suasana lebih personal.",
    priceRange: "$$",
    rating: 4.6,
    reviewCount: 193,
    vibes: ["Artsy", "Cozy", "Manual brew"],
    amenities: ["WiFi cepat", "Indoor AC", "Roastery", "Brunch"],
    imageUrl:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=80",
    mapsUrl: "https://maps.google.com/?q=Noor+Kopi+Yogyakarta",
    instagramUrl: "https://instagram.com/noorkopi",
    hours: [{ day: "Setiap hari", open: "08.00 - 21.00" }],
    wifiFriendly: true,
    source: "editorial",
    coordinates: { lat: -7.821384, lng: 110.364856 },
  },
  {
    id: "seed-5",
    slug: "kroma-roasters-surabaya",
    name: "Kroma Roasters",
    city: "Surabaya",
    neighborhood: "Darmo",
    address: "Jl. Raya Darmo No.102, Surabaya",
    description:
      "Roastery modern untuk latte halus, meeting singkat, dan kerja mendalam sampai malam.",
    longDescription:
      "Kroma memadukan kursi lounge, communal table, dan bar kopi yang serius. Ideal untuk founder meetup, review deck, atau sekadar recharge di tengah kota.",
    priceRange: "$$",
    rating: 4.7,
    reviewCount: 221,
    vibes: ["Roastery", "Modern", "Business casual"],
    amenities: [
      "WiFi cepat",
      "Meeting room",
      "Indoor AC",
      "Parking",
      "Roastery",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80",
    mapsUrl: "https://maps.google.com/?q=Kroma+Roasters+Surabaya",
    instagramUrl: "https://instagram.com/kromaroasters",
    hours: [
      { day: "Senin - Jumat", open: "08.00 - 22.00" },
      { day: "Sabtu - Minggu", open: "09.00 - 23.00" },
    ],
    wifiFriendly: true,
    featured: true,
    source: "editorial",
    coordinates: { lat: -7.287667, lng: 112.737826 },
  },
  {
    id: "seed-6",
    slug: "ruang-teduh-semarang",
    name: "Ruang Teduh",
    city: "Semarang",
    neighborhood: "Gajahmungkur",
    address: "Jl. Papandayan No.14, Semarang",
    description:
      "Cafe teduh dengan halaman hijau, cocok untuk catch-up santai dan kerja yang tidak terburu.",
    longDescription:
      "Ruang Teduh lebih kalem daripada coffee bar cepat. Ada area outdoor rindang, menu sarapan ringan, dan sudut nyaman untuk laptop maupun ngobrol lama.",
    priceRange: "$$",
    rating: 4.4,
    reviewCount: 148,
    vibes: ["Garden", "Slow morning", "Relaxed"],
    amenities: ["WiFi cepat", "Outdoor", "Brunch", "Parking"],
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    mapsUrl: "https://maps.google.com/?q=Ruang+Teduh+Semarang",
    instagramUrl: "https://instagram.com/ruangteduh",
    hours: [{ day: "Setiap hari", open: "07.00 - 21.00" }],
    wifiFriendly: true,
    source: "editorial",
    coordinates: { lat: -7.005145, lng: 110.421866 },
  },
];

export const cityOptions = [...new Set(coffeeShops.map((shop) => shop.city))];
export const vibeOptions = [...new Set(coffeeShops.flatMap((shop) => shop.vibes))];

export const seededSubmissions: CoffeeSubmission[] = [
  {
    id: "submission-seed-approved",
    slug: "kilogram-solo",
    name: "Kilogram Solo",
    city: "Solo",
    neighborhood: "Laweyan",
    address: "Jl. Dr. Rajiman No.419, Solo",
    description:
      "Cafe clean industrial dengan menu seasonal, meja panjang, dan traffic yang ramah untuk deep work.",
    priceRange: "$$",
    vibes: ["Industrial", "Work-friendly", "Seasonal menu"],
    amenities: ["WiFi cepat", "Colokan banyak", "Indoor AC", "Brunch"],
    imageUrl:
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
    mapsUrl: "https://maps.google.com/?q=Kilogram+Solo",
    instagramUrl: "https://instagram.com/kilogramsolo",
    submittedAt: "2026-03-11T09:30:00.000Z",
    status: "approved",
    adminNote: "Layak tampil. Foto, maps, dan positioning brand sudah jelas.",
  },
  {
    id: "submission-seed-pending",
    slug: "senja-sore-makassar",
    name: "Senja Sore",
    city: "Makassar",
    neighborhood: "Panakkukang",
    address: "Jl. Boulevard No.88, Makassar",
    description:
      "Cafe ramah komunitas dengan seating luas, cold brew, dan area semi outdoor untuk event kecil.",
    priceRange: "$",
    vibes: ["Community", "Lively", "Budget-friendly"],
    amenities: ["WiFi cepat", "Outdoor", "Parking", "Pet friendly"],
    imageUrl:
      "https://images.unsplash.com/photo-1463797221720-6b07e6426c24?auto=format&fit=crop&w=1200&q=80",
    mapsUrl: "https://maps.google.com/?q=Senja+Sore+Makassar",
    instagramUrl: "https://instagram.com/senjasorecoffee",
    submittedAt: "2026-04-03T05:45:00.000Z",
    status: "pending",
  },
  {
    id: "submission-seed-rejected",
    slug: "kopi-pasar-medan",
    name: "Kopi Pasar",
    city: "Medan",
    neighborhood: "Kesawan",
    address: "Jl. Ahmad Yani No.52, Medan",
    description:
      "Spot sederhana dekat area heritage yang ramai untuk ngopi cepat sebelum lanjut jalan kaki.",
    priceRange: "$",
    vibes: ["Quick stop", "Heritage", "Street-side"],
    amenities: ["Outdoor", "Parking"],
    imageUrl:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
    mapsUrl: "https://maps.google.com/?q=Kopi+Pasar+Medan",
    instagramUrl: "https://instagram.com/kopipasarmedan",
    submittedAt: "2026-02-18T14:15:00.000Z",
    status: "rejected",
    adminNote: "Deskripsi terlalu tipis dan belum ada bukti jam operasional yang konsisten.",
  },
];
