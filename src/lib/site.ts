/** The single official public origin for MUST Market. */
export const SITE_URL = "https://mustmarket.store";

/** Absolute self-referencing URL for a path such as "/market/electronics". */
export function canonical(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Permanent marketplace category landing pages (slug -> stored category name). */
export const MARKET_CATEGORY_PAGES = {
  electronics: {
    path: "/market/electronics",
    dbName: "Electronics",
    title: "Used Electronics at MUST Market | Mbeya University",
    heading: "Used Electronics at MUST",
    description:
      "Buy and sell used laptops, phones, speakers and campus electronics from verified Mbeya University of Science and Technology students.",
    intro:
      "Laptops, phones, chargers, speakers and study gadgets sold directly by MUST students. Every listing shows the seller's campus location so you can inspect the item before you pay, and contact happens straight over WhatsApp.",
  },
  "rooms-gheto": {
    path: "/market/rooms-gheto",
    dbName: "Rooms / Gheto",
    title: "Rooms & Gheto Near MUST | MUST Market",
    heading: "Rooms & Gheto Near MUST",
    description:
      "Find rooms, gheto and hostel space near Mbeya University of Science and Technology, posted by students who live there.",
    intro:
      "Rooms and gheto around Iyunga and the MUST campus, posted by the students moving out. Compare prices, see the exact area, and reach the person renting it directly.",
  },
  "books-stationery": {
    path: "/market/books-stationery",
    dbName: "Books/Stationery",
    title: "Books & Study Supplies | MUST Market",
    heading: " MUST Book Store",
    description:
      "Second-hand textbooks, notes, calculators and stationery for Mbeya University of Science and Technology courses.",
    intro:
      "Course textbooks, drawing sets, calculators and stationery passed on by students who have finished the module. Cheaper than the bookshop, and always on campus.",
  },
  "used-items": {
    path: "/market/used-items",
    dbName: "Room/Hostel Gear",
    title: "Buy & Sell Used Items at MUST | MUST Market",
    heading: "Buy & Sell Used Items at MUST",
    description:
      "Hostel gear, kitchenware, furniture and everyday used items for sale between Mbeya University students.",
    intro:
      "Buckets, kettles, mattresses, fans, shelves — the everyday hostel things students sell on when they move. List yours in a minute, or pick one up from someone a block away.",
  },
} as const;

export type MarketCategorySlug = keyof typeof MARKET_CATEGORY_PAGES;

/** Partner bookstore (Books24) — opens in a new tab wherever "Books" is linked. */
export const BOOKS24_URL = "https://books24.store/mustmarket";

/** Official MUST Market Instagram page — used by the footer icon and the "Updates" drawer link. */
export const INSTAGRAM_URL =
  "https://www.instagram.com/mustmarket__01?stkn=dzE0YXVtZDI3eWNo";
