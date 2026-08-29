import { supabase } from "@/integrations/supabase/client";

export async function requireAdminUser() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;
  if (userError || !user || user.is_anonymous) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const { data: role, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) throw new Error(`Could not verify administrator access: ${roleError.message}`);
  if (!role) throw new Error("Administrator access is required for this action.");
  return user;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    await requireAdminUser();
    return true;
  } catch {
    return false;
  }
}
