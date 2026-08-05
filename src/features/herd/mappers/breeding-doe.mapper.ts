import type {
  BreedingDoe,
  BreedingDoeRow,
  CreateBreedingDoeInput,
  ReproductiveCycle,
  ReproductiveCycleRow,
} from "../types/breeding-doe.types";
import type { BreedingDoeStatus, ReproductiveCycleStatus } from "../constants/breeding-doe.constants";

function parseDoeStatus(v: unknown): BreedingDoeStatus {
  const s = ["active", "pregnant", "lactating", "retired", "sold"] as const;
  return s.includes(v as BreedingDoeStatus) ? (v as BreedingDoeStatus) : "active";
}

function parseCycleStatus(v: unknown): ReproductiveCycleStatus {
  const s = ["planned", "pregnant", "kidded", "failed"] as const;
  return s.includes(v as ReproductiveCycleStatus) ? (v as ReproductiveCycleStatus) : "planned";
}

export function mapBreedingDoeRowToDomain(
  row: BreedingDoeRow,
  extras?: { barnName?: string; batchName?: string; expectedKiddingDate?: string | null },
): BreedingDoe {
  return {
    id: row.id,
    farmId: row.farm_id,
    tagCode: row.tag_code,
    barcode: row.barcode,
    name: row.name,
    breed: row.breed,
    birthDate: row.birth_date,
    batchId: row.batch_id,
    barnId: row.barn_id,
    barnName: extras?.barnName,
    batchName: extras?.batchName,
    status: parseDoeStatus(row.status),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expectedKiddingDate: extras?.expectedKiddingDate ?? null,
  };
}

export function mapCreateDoeToRow(
  farmId: string,
  id: string,
  tagCode: string,
  barcode: string,
  input: CreateBreedingDoeInput,
  nowIso: string,
): BreedingDoeRow {
  return {
    id,
    farm_id: farmId,
    tag_code: tagCode,
    barcode,
    name: input.name.trim(),
    breed: input.breed.trim(),
    birth_date: input.birthDate,
    batch_id: input.batchId ?? null,
    barn_id: input.barnId ?? null,
    status: input.status ?? "active",
    notes: input.notes?.trim() || null,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

export function mapReproductiveCycleRowToDomain(row: ReproductiveCycleRow): ReproductiveCycle {
  return {
    id: row.id,
    farmId: row.farm_id,
    doeId: row.doe_id,
    cycleNumber: row.cycle_number,
    matingDate: row.mating_date,
    expectedKiddingDate: row.expected_kidding_date,
    actualKiddingDate: row.actual_kidding_date,
    kidsCount: row.kids_count,
    status: parseCycleStatus(row.status),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
