import { randomUUID } from "crypto";
import { AppError } from "@/lib/errors/app-error";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { DevelopmentStage } from "../constants/development-stage.constants";
import {
  mapCreateGoatBatchToRow,
  mapGoatBatchRowToDomain,
  mapUpdateGoatBatchToRow,
} from "../mappers/goat-batch.mapper";
import type {
  CreateGoatBatchInput,
  GoatBatchListFilter,
  GoatBatchRow,
  UpdateGoatBatchInput,
} from "../types/goat-batch.types";
import type { GoatBatchRepository } from "./goat-batch.repository";

function parseStage(value: unknown): DevelopmentStage {
  const stages = ["newborn", "weaning", "grower", "finisher", "breeder"] as const;
  return stages.includes(value as DevelopmentStage) ? (value as DevelopmentStage) : "newborn";
}

function normalizeRow(row: Record<string, unknown>): GoatBatchRow {
  return {
    id: String(row.id),
    farm_id: String(row.farm_id),
    name: String(row.name),
    batch_code: String(row.batch_code),
    barn_id: String(row.barn_id),
    breed: String(row.breed),
    gender: row.gender === "male" || row.gender === "female" ? row.gender : "mixed",
    birth_date: String(row.birth_date).slice(0, 10),
    quantity: Number(row.quantity),
    source:
      row.source === "purchased" ||
      row.source === "transferred" ||
      row.source === "other"
        ? row.source
        : "born_on_farm",
    status:
      row.status === "sold" || row.status === "moved_out" || row.status === "closed"
        ? row.status
        : "active",
    development_stage: parseStage(row.development_stage),
    stage_override: Boolean(row.stage_override),
    supplier_info: row.supplier_info === null || row.supplier_info === undefined ? null : String(row.supplier_info),
    notes: row.notes === null || row.notes === undefined ? null : String(row.notes),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export class SupabaseGoatBatchRepository implements GoatBatchRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  private async barnNameMap(farmId: string, barnIds: string[]) {
    if (barnIds.length === 0) return new Map<string, string>();
    const supabase = await this.client();
    const { data } = await supabase
      .from("barns")
      .select("id, name")
      .eq("farm_id", farmId)
      .in("id", barnIds);
    return new Map((data ?? []).map((b) => [String(b.id), String(b.name)]));
  }

  async listBatches(farmId: string, filter?: GoatBatchListFilter) {
    const supabase = await this.client();
    let query = supabase.from("goat_batches").select("*").eq("farm_id", farmId);

    if (filter?.status && filter.status !== "all") {
      query = query.eq("status", filter.status);
    }
    if (filter?.barnId && filter.barnId !== "all") {
      query = query.eq("barn_id", filter.barnId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    let rows = (data ?? []).map((row) => normalizeRow(row));
    if (filter?.search?.trim()) {
      const q = filter.search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.batch_code.toLowerCase().includes(q) ||
          r.breed.toLowerCase().includes(q),
      );
    }

    const names = await this.barnNameMap(
      farmId,
      [...new Set(rows.map((r) => r.barn_id))],
    );
    return rows.map((row) => mapGoatBatchRowToDomain(row, names.get(row.barn_id)));
  }

  async getBatchById(farmId: string, batchId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("goat_batches")
      .select("*")
      .eq("farm_id", farmId)
      .eq("id", batchId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    const row = normalizeRow(data);
    const names = await this.barnNameMap(farmId, [row.barn_id]);
    return mapGoatBatchRowToDomain(row, names.get(row.barn_id));
  }

  async getBatchByCode(farmId: string, batchCode: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("goat_batches")
      .select("*")
      .eq("farm_id", farmId)
      .ilike("batch_code", batchCode)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    const row = normalizeRow(data);
    const names = await this.barnNameMap(farmId, [row.barn_id]);
    return mapGoatBatchRowToDomain(row, names.get(row.barn_id));
  }

  async listBatchCodes(farmId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("goat_batches")
      .select("batch_code")
      .eq("farm_id", farmId);

    if (error) throw error;
    return (data ?? []).map((r) => String(r.batch_code));
  }

  async batchCodeExists(farmId: string, batchCode: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("goat_batches")
      .select("id")
      .eq("farm_id", farmId)
      .ilike("batch_code", batchCode)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }

  async createBatch(farmId: string, input: CreateGoatBatchInput, nowIso: string) {
    if (await this.batchCodeExists(farmId, input.batchCode)) {
      throw new AppError("VALIDATION_ERROR", "Mã đàn đã tồn tại");
    }

    const supabase = await this.client();
    const { data: barn, error: barnError } = await supabase
      .from("barns")
      .select("id, name")
      .eq("farm_id", farmId)
      .eq("id", input.barnId)
      .maybeSingle();

    if (barnError) throw barnError;
    if (!barn) throw new AppError("VALIDATION_ERROR", "Chuồng không tồn tại");

    const id = randomUUID();
    const row = mapCreateGoatBatchToRow(farmId, id, input, nowIso);
    const { data, error } = await supabase.from("goat_batches").insert(row).select("*").single();
    if (error) throw error;
    return mapGoatBatchRowToDomain(normalizeRow(data), String(barn.name));
  }

  async updateBatch(farmId: string, batchId: string, input: UpdateGoatBatchInput, nowIso: string) {
    const existing = await this.getBatchById(farmId, batchId);
    if (!existing) throw new AppError("NOT_FOUND", "Không tìm thấy lứa");

    const supabase = await this.client();
    const patch = mapUpdateGoatBatchToRow(input, nowIso);
    const { data, error } = await supabase
      .from("goat_batches")
      .update(patch)
      .eq("farm_id", farmId)
      .eq("id", batchId)
      .select("*")
      .single();

    if (error) throw error;
    const row = normalizeRow(data);
    const names = await this.barnNameMap(farmId, [row.barn_id]);
    return mapGoatBatchRowToDomain(row, names.get(row.barn_id));
  }
}
