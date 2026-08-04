import type { Barn, BarnRow, CreateBarnInput } from "../types/barn.types";

export function mapBarnRowToDomain(row: BarnRow): Barn {
  return {
    id: row.id,
    farmId: row.farm_id,
    name: row.name,
    capacity: row.capacity,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCreateBarnToRow(
  farmId: string,
  id: string,
  input: CreateBarnInput,
  nowIso: string,
): BarnRow {
  return {
    id,
    farm_id: farmId,
    name: input.name.trim(),
    capacity: input.capacity ?? null,
    status: "active",
    created_at: nowIso,
    updated_at: nowIso,
  };
}
