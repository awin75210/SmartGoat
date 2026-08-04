import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AppError } from "@/lib/errors/app-error";

export async function insertDefaultBarns(farmId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const rows = [
    {
      id: `barn-${farmId}-a`,
      farm_id: farmId,
      name: "Chuồng A",
      capacity: 24,
      status: "active",
      updated_at: now,
    },
    {
      id: `barn-${farmId}-b`,
      farm_id: farmId,
      name: "Chuồng B",
      capacity: 24,
      status: "active",
      updated_at: now,
    },
  ];

  const { error } = await supabase.from("barns").insert(rows);
  if (error && !error.message.includes("duplicate")) {
    throw new AppError("INTERNAL_ERROR", error.message);
  }
}
