import { AppError } from "@/lib/errors/app-error";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { mapFarmRowToDomain } from "../mappers/admin.mapper";
import type { FarmRow } from "../types/admin.types";
import type { CreateFarmRowInput } from "../types/admin.types";
import type { FarmRepository } from "./farm.repository";

function normalizeFarmRow(row: Record<string, unknown>): FarmRow {
  return {
    id: String(row.id),
    name: String(row.name),
    owner_email: String(row.owner_email),
    location: String(row.location ?? ""),
    goat_count: Number(row.goat_count ?? 0),
    device_count: Number(row.device_count ?? 0),
    status: row.status === "suspended" ? "suspended" : "active",
    updated_at: String(row.updated_at),
  };
}

export class SupabaseFarmRepository implements FarmRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async listFarms() {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("farms")
      .select("*, devices(count)")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => {
      const devices = row.devices as { count: number }[] | null;
      const deviceCount = devices?.[0]?.count ?? 0;
      return mapFarmRowToDomain(
        normalizeFarmRow({
          ...row,
          device_count: deviceCount,
        }),
      );
    });
  }

  async getFarmById(farmId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("farms")
      .select("*, devices(count)")
      .eq("id", farmId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const devices = data.devices as { count: number }[] | null;
    return mapFarmRowToDomain(
      normalizeFarmRow({
        ...data,
        device_count: devices?.[0]?.count ?? 0,
      }),
    );
  }

  async createFarm(input: CreateFarmRowInput) {
    const supabase = await this.client();
    const row = {
      id: input.id,
      name: input.name,
      owner_email: input.ownerEmail,
      location: input.location,
      goat_count: input.goatCount ?? 0,
      status: "active",
      updated_at: input.nowIso,
    };

    const { data, error } = await supabase.from("farms").insert(row).select("*").single();
    if (error) throw error;

    return mapFarmRowToDomain(normalizeFarmRow({ ...data, device_count: 0 }));
  }

  async deleteFarm(farmId: string) {
    const supabase = await this.client();
    await unlinkProfilesFromFarm(farmId);
    await deleteFarmSettingsRow(farmId);
    const { error } = await supabase.from("farms").delete().eq("id", farmId);
    if (error) throw error;
  }
}

async function unlinkProfilesFromFarm(farmId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("profiles").update({ farm_id: null }).eq("farm_id", farmId);
  if (error) throw error;
}

async function deleteFarmSettingsRow(farmId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("farm_settings").delete().eq("farm_id", farmId);
  if (error && !error.message.includes("does not exist")) {
    throw new AppError("INTERNAL_ERROR", error.message);
  }
}

export async function deleteFarmSettings(farmId: string): Promise<void> {
  await deleteFarmSettingsRow(farmId);
}

export async function insertFarmSettings(
  farmId: string,
  farmName: string,
  alertEmail: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("farm_settings").insert({
    farm_id: farmId,
    farm_name: farmName,
    timezone: "Asia/Ho_Chi_Minh",
    alert_email: alertEmail,
    notify_push: true,
    notify_email: true,
    temperature_high_c: 28,
    ammonia_max_ppm: 10,
  });

  if (error && !error.message.includes("duplicate")) {
    throw new AppError("INTERNAL_ERROR", error.message);
  }
}
