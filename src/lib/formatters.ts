// Strict Tanzanian phone sanitizer for payment gateways.
// Strips all non-numeric characters, converts a leading "0" to the
// "255" country code, and enforces the "255XXXXXXXXX" (12-digit) shape.

export function sanitizeTzPhoneStrict(input: string): string | null {
  const digits = (input ?? "").replace(/\D/g, "");
  if (!digits) return null;

  let normalized = digits;
  if (normalized.startsWith("0")) normalized = "255" + normalized.slice(1);
  else if (!normalized.startsWith("255") && normalized.length === 9) {
    normalized = "255" + normalized;
  }

  if (normalized.length !== 12 || !normalized.startsWith("255")) return null;
  return normalized;
}

export function isValidTzPhone(input: string): boolean {
  return sanitizeTzPhoneStrict(input) !== null;
}
