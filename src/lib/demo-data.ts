export type ProductCondition = "Like New" | "Good" | "Fair";

export interface DemoProduct {
  id: string;
  title: string;
  price: number;
  condition: ProductCondition;
  category: string;
  location: string;
  seller: { name: string; verified: boolean };
  image: string;
  gradient: string;
  emoji: string;
  description: string;
}

// Placeholder gradients acting as high-res image stand-ins until sellers upload real photos.
export const demoProducts: DemoProduct[] = [
  {
    id: "p1",
    title: "MacBook Air M1 · 8GB / 256GB",
    price: 1250000,
    condition: "Like New",
    category: "Electronics",
    location: "Hostel Block C",
    seller: { name: "Amani K.", verified: true },
    image: "",
    gradient: "from-slate-800 via-slate-700 to-emerald-900",
    emoji: "💻",
    description:
      "Barely used MacBook Air M1. Battery cycle count 42. Comes with original charger and sleeve. Perfect for coding, design work and long lecture days.",
  },
  {
    id: "p2",
    title: "Study Desk Lamp · USB-C",
    price: 22000,
    condition: "Good",
    category: "Room/Hostel Gear",
    location: "Hostel Block A",
    seller: { name: "Neema M.", verified: true },
    image: "",
    gradient: "from-amber-300 via-orange-300 to-rose-300",
    emoji: "💡",
    description:
      "Dimmable LED desk lamp with 3 color temperatures. USB-C powered, works with any phone charger. No flicker, easy on the eyes for night reading.",
  },
  {
    id: "p3",
    title: "Engineering Mathematics Vol.1",
    price: 15000,
    condition: "Good",
    category: "Books/Stationery",
    location: "Main Campus",
    seller: { name: "Baraka J.", verified: false },
    image: "",
    gradient: "from-emerald-700 via-emerald-600 to-teal-500",
    emoji: "📘",
    description:
      "Highlighted in a few chapters, no torn pages. Ideal for BEng and BSc year-one students. Cash pickup or WhatsApp delivery within campus.",
  },
  {
    id: "p5",
    title: "JBL Go 3 Bluetooth Speaker",
    price: 55000,
    condition: "Good",
    category: "Electronics",
    location: "Hostel Block B",
    seller: { name: "Elias P.", verified: true },
    image: "",
    gradient: "from-rose-600 via-red-500 to-orange-500",
    emoji: "🔊",
    description:
      "Loud, waterproof and small enough to slide in a backpack. Original box, USB-C cable included. Great for hostel jams.",
  },
  {
    id: "p6",
    title: "Mini Electric Kettle · 1L",
    price: 28000,
    condition: "Like New",
    category: "Room/Hostel Gear",
    location: "Hostel Block D",
    seller: { name: "Zawadi H.", verified: false },
    image: "",
    gradient: "from-cyan-500 via-sky-500 to-blue-600",
    emoji: "☕",
    description:
      "Boils water in under 3 minutes. Auto shut-off, no burnt smell. Perfect for coffee, chai and 2-minute noodles between lectures.",
  },
  {
    id: "p7",
    title: "Scientific Calculator · Casio fx-991",
    price: 35000,
    condition: "Good",
    category: "Books/Stationery",
    location: "Main Campus",
    seller: { name: "Doreen L.", verified: true },
    image: "",
    gradient: "from-neutral-800 via-neutral-700 to-neutral-600",
    emoji: "🧮",
    description:
      "The exam-approved workhorse. All buttons functional, screen crisp, back cover intact. Needed a newer one, letting this go cheap.",
  },
  {
    id: "p8",
    title: "Comfy Study Chair · Mesh Back",
    price: 85000,
    condition: "Fair",
    category: "Room/Hostel Gear",
    location: "Iyunga",
    seller: { name: "Kelvin R.", verified: true },
    image: "",
    gradient: "from-emerald-900 via-teal-800 to-slate-800",
    emoji: "🪑",
    description:
      "Height-adjustable with tilt lock. Small scratch on the base, otherwise solid. Saved my back through three semesters of finals.",
  },
];

export interface CategoryDef {
  /** Display label (may contain a line break for compact pills). */
  name: string;
  /** Exact category name stored in the database — used for filtering. */
  dbName: string;
  slug: string;
  emoji: string;
}

export const categories: CategoryDef[] = [
  { name: "Electronics", dbName: "Electronics", slug: "electronics", emoji: "💻" },
  { name: "Room\nItems", dbName: "Room/Hostel Gear", slug: "room-hostel", emoji: "🛏️" },
  { name: "Books/Stationery", dbName: "Books/Stationery", slug: "books", emoji: "📚" },
  { name: "Fashion", dbName: "Fashion", slug: "fashion", emoji: "👕" },
  { name: "Online\nServices", dbName: "Online Services", slug: "online-services", emoji: "📶" },
  { name: "Rooms / Gheto", dbName: "Rooms / Gheto", slug: "rooms-gheto", emoji: "🏠" },
];

/** Display label for a database category name. */
export function categoryLabel(dbName: string) {
  return categories.find((c) => c.dbName === dbName)?.name ?? dbName;
}

/** Emoji for a database category name. */
export function categoryEmoji(dbName: string) {
  return categories.find((c) => c.dbName === dbName)?.emoji ?? "📦";
}


export function formatTsh(n: number) {
  return `TSh ${n.toLocaleString("en-US")}`;
}
