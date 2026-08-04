import { randomUUID } from "crypto";
import { AppError } from "@/lib/errors/app-error";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { mapBarnRowToDomain, mapCreateBarnToRow } from "../mappers/barn.mapper";
import type { BarnRow, CreateBarnInput, UpdateBarnInput } from "../types/barn.types";
import type { BarnRepository } from "./barn.repository";

function normalizeRow(row: Record<string, unknown>): BarnRow {
  return {
    id: String(row.id),
    farm_id: String(row.farm_id),
    name: String(row.name),
    capacity: row.capacity === null || row.capacity === undefined ? null : Number(row.capacity),
    status: row.status === "inactive" ? "inactive" : "active",
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export class SupabaseBarnRepository implements BarnRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async listBarns(farmId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("barns")
      .select("*")
      .eq("farm_id", farmId)
      .order("name");

    if (error) throw error;
    return (data ?? []).map((row) => mapBarnRowToDomain(normalizeRow(row)));
  }

  async getBarnById(farmId: string, barnId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("barns")
      .select("*")
      .eq("farm_id", farmId)
      .eq("id", barnId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapBarnRowToDomain(normalizeRow(data)) : null;
  }

  async createBarn(farmId: string, input: CreateBarnInput, nowIso: string) {
    const id = `barn-${farmId}-${randomUUID().slice(0, 8)}`;
    const row = mapCreateBarnToRow(farmId, id, input, nowIso);
    const supabase = await this.client();
    const { data, error } = await supabase.from("barns").insert(row).select("*").single();
    if (error) throw error;
    return mapBarnRowToDomain(normalizeRow(data));
  }

  async updateBarn(farmId: string, barnId: string, input: UpdateBarnInput, nowIso: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("barns")
      .update({
        name: input.name.trim(),
        capacity: input.capacity ?? null,
        status: input.status,
        updated_at: nowIso,
      })
      .eq("farm_id", farmId)
      .eq("id", barnId)
      .select("*")
      .single();

    if (error) throw new AppError("NOT_FOUND");
    return mapBarnRowToDomain(normalizeRow(data));
  }
}
