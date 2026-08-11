/** The single administrator account allowed into /admin. */
export const ADMIN_EMAIL = "hmbusiness49@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
  return (email ?? "").toLowerCase() === ADMIN_EMAIL;
}
