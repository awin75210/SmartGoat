import type { DevelopmentStage } from "../constants/development-stage.constants";
import { resolveBatchStage } from "../utils/stage.utils";
import type {
  CreateGoatBatchInput,
  GoatBatch,
  GoatBatchRow,
  UpdateGoatBatchInput,
} from "../types/goat-batch.types";

function parseStage(value: unknown): DevelopmentStage {
  const stages = ["newborn", "weaning", "grower", "finisher", "breeder"] as const;
  return stages.includes(value as DevelopmentStage) ? (value as DevelopmentStage) : "newborn";
}

export function mapGoatBatchRowToDomain(row: GoatBatchRow, barnName?: string): GoatBatch {
  const developmentStage = parseStage(row.development_stage);
  return {
    id: row.id,
    farmId: row.farm_id,
    name: row.name,
    batchCode: row.batch_code,
    barnId: row.barn_id,
    barnName,
    breed: row.breed,
    gender: row.gender,
    birthDate: row.birth_date,
    quantity: row.quantity,
    source: row.source,
    status: row.status,
    developmentStage,
    effectiveStage: resolveBatchStage(row.birth_date, developmentStage, row.stage_override),
    stageOverride: row.stage_override,
    supplierInfo: row.supplier_info,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCreateGoatBatchToRow(
  farmId: string,
  id: string,
  input: CreateGoatBatchInput,
  nowIso: string,
): GoatBatchRow {
  return {
    id,
    farm_id: farmId,
    name: input.name.trim(),
    batch_code: input.batchCode.trim(),
    barn_id: input.barnId,
    breed: input.breed.trim(),
    gender: input.gender,
    birth_date: input.birthDate,
    quantity: input.quantity,
    source: input.source,
    status: input.status,
    development_stage: input.developmentStage ?? "newborn",
    stage_override: input.stageOverride ?? false,
    supplier_info: input.supplierInfo?.trim() || null,
    notes: input.notes?.trim() || null,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

export function mapUpdateGoatBatchToRow(
  input: UpdateGoatBatchInput,
  nowIso: string,
): Partial<GoatBatchRow> {
  const row: Partial<GoatBatchRow> = { updated_at: nowIso };
  if (input.name !== undefined) row.name = input.name.trim();
  if (input.barnId !== undefined) row.barn_id = input.barnId;
  if (input.breed !== undefined) row.breed = input.breed.trim();
  if (input.gender !== undefined) row.gender = input.gender;
  if (input.birthDate !== undefined) row.birth_date = input.birthDate;
  if (input.quantity !== undefined) row.quantity = input.quantity;
  if (input.source !== undefined) row.source = input.source;
  if (input.status !== undefined) row.status = input.status;
  if (input.developmentStage !== undefined) row.development_stage = input.developmentStage;
  if (input.stageOverride !== undefined) row.stage_override = input.stageOverride;
  if (input.supplierInfo !== undefined) row.supplier_info = input.supplierInfo?.trim() || null;
  if (input.notes !== undefined) row.notes = input.notes?.trim() || null;
  return row;
}

export function schemaPayloadToCreateInput(payload: {
  name: string;
  barn_id: string;
  breed: string;
  gender: CreateGoatBatchInput["gender"];
  birth_date: Date;
  quantity: number;
  source: CreateGoatBatchInput["source"];
  status: CreateGoatBatchInput["status"];
  development_stage?: DevelopmentStage;
  stage_override?: boolean;
  supplier_info?: string | null;
  notes?: string | null;
  batchCode: string;
}): CreateGoatBatchInput {
  const y = payload.birth_date.getFullYear();
  const m = String(payload.birth_date.getMonth() + 1).padStart(2, "0");
  const d = String(payload.birth_date.getDate()).padStart(2, "0");
  return {
    name: payload.name,
    batchCode: payload.batchCode.trim(),
    barnId: payload.barn_id,
    breed: payload.breed,
    gender: payload.gender,
    birthDate: `${y}-${m}-${d}`,
    quantity: payload.quantity,
    source: payload.source,
    status: payload.status,
    developmentStage: payload.development_stage,
    stageOverride: payload.stage_override,
    supplierInfo: payload.supplier_info ?? null,
    notes: payload.notes ?? null,
  };
}
