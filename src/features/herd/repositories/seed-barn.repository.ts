import { randomUUID } from "crypto";
import { AppError } from "@/lib/errors/app-error";
import { mapBarnRowToDomain, mapCreateBarnToRow } from "../mappers/barn.mapper";
import type { BarnRow, CreateBarnInput, UpdateBarnInput } from "../types/barn.types";
import type { BarnRepository } from "./barn.repository";

const barnStore = new Map<string, BarnRow[]>();

function getFarmBarns(farmId: string): BarnRow[] {
  if (!barnStore.has(farmId)) {
    barnStore.set(farmId, []);
  }
  return barnStore.get(farmId)!;
}

export class SeedBarnRepository implements BarnRepository {
  async listBarns(farmId: string) {
    return getFarmBarns(farmId).map(mapBarnRowToDomain);
  }

  async getBarnById(farmId: string, barnId: string) {
    const row = getFarmBarns(farmId).find((b) => b.id === barnId);
    return row ? mapBarnRowToDomain(row) : null;
  }

  async createBarn(farmId: string, input: CreateBarnInput, nowIso: string) {
    const id = `barn-${farmId}-${randomUUID().slice(0, 8)}`;
    const row = mapCreateBarnToRow(farmId, id, input, nowIso);
    getFarmBarns(farmId).push(row);
    return mapBarnRowToDomain(row);
  }

  async updateBarn(farmId: string, barnId: string, input: UpdateBarnInput, nowIso: string) {
    const rows = getFarmBarns(farmId);
    const idx = rows.findIndex((b) => b.id === barnId);
    if (idx < 0) throw new AppError("NOT_FOUND");
    rows[idx] = {
      ...rows[idx],
      name: input.name.trim(),
      capacity: input.capacity ?? null,
      status: input.status ?? rows[idx].status,
      updated_at: nowIso,
    };
    return mapBarnRowToDomain(rows[idx]);
  }
}
