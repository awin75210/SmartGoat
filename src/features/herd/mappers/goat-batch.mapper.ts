import type { CreateGoatBatchInput, GoatBatch, GoatBatchRow } from "../types/goat-batch.types";

export function mapGoatBatchRowToDomain(
  row: GoatBatchRow,
  barnName?: string,
): GoatBatch {
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
    notes: input.notes?.trim() || null,
    created_at: nowIso,
    updated_at: nowIso,
  };
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
    notes: payload.notes ?? null,
  };
}
