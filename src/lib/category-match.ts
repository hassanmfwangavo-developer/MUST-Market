import type { MenuItem } from "@/lib/menu";

const STOPWORDS = new Set([
  "and",
  "the",
  "dishes",
  "dish",
  "food",
  "foods",
  "others",
  "other",
  "zote",
  "all",
]);

/** Splits "Chips & Fast Food" into ["chips", "fast"]. */
export function categoryTokens(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/**
 * Menu rows store a free-text category that rarely matches the admin category
 * label exactly, so we match on shared keywords across category, name and
 * description instead of a strict equality check.
 */
export function matchesCategory(item: MenuItem, categoryName: string): boolean {
  const cat = categoryName.trim().toLowerCase();
  if (!cat) return true;
  const itemCat = item.category.toLowerCase();
  if (itemCat === cat) return true;
  if (itemCat.includes(cat) || cat.includes(itemCat)) return true;

  const tokens = categoryTokens(categoryName);
  if (tokens.length === 0) return false;
  const haystack = `${item.category} ${item.name} ${item.description}`.toLowerCase();
  return tokens.some((t) => haystack.includes(t));
}
