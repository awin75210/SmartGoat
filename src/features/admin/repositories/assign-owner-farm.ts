import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin-client";

/** Gán farm_id cho profile chủ trại (Supabase) theo email đăng nhập. */
export async function assignOwnerFarmIdByEmail(
  ownerEmail: string,
  farmId: string,
): Promise<boolean> {
  const admin = tryCreateSupabaseAdminClient();
  if (!admin) return false;

  const email = ownerEmail.trim().toLowerCase();
  const { data, error } = await admin
    .from("profiles")
    .update({ farm_id: farmId })
    .eq("email", email)
    .select("id")
    .maybeSingle();

  if (error) {
    console.warn("[admin] assignOwnerFarmIdByEmail failed", error.message);
    return false;
  }

  return Boolean(data?.id);
}
