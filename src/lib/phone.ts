// Sanitize a Tanzanian phone number for WhatsApp use.
// Removes spaces, dashes, parentheses, and plus signs.
// If the result starts with "0", strip it and prepend "255".
// If it already starts with "255", leave the country code alone.
export function sanitizeTzPhone(input: string): string {
  const digits = (input ?? "").replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return "255" + digits.slice(1);
  if (digits.startsWith("255")) return digits;
  // Fallback: assume it's already a local number missing the leading 0
  if (digits.length === 9) return "255" + digits;
  return digits;
}
