import { randomUUID } from "crypto";
import { AppError } from "@/lib/errors/app-error";
import { inferDevelopmentStage } from "../utils/stage.utils";
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
import type { BarnRow } from "../types/barn.types";
import type { GoatBatchRepository } from "./goat-batch.repository";
import { SeedBarnRepository } from "./seed-barn.repository";

const batchStore = new Map<string, GoatBatchRow[]>();
const barnRepo = new SeedBarnRepository();

function getFarmBatches(farmId: string): GoatBatchRow[] {
  if (!batchStore.has(farmId)) {
    batchStore.set(farmId, []);
  }
  return batchStore.get(farmId)!;
}

async function resolveBarnName(farmId: string, barnId: string): Promise<string | undefined> {
  const barn = await barnRepo.getBarnById(farmId, barnId);
  return barn?.name;
}

function applyFilter(rows: GoatBatchRow[], filter?: GoatBatchListFilter) {
  let list = rows;
  if (filter?.status && filter.status !== "all") {
    list = list.filter((r) => r.status === filter.status);
  }
  if (filter?.barnId && filter.barnId !== "all") {
    list = list.filter((r) => r.barn_id === filter.barnId);
  }
  if (filter?.search?.trim()) {
    const q = filter.search.trim().toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.batch_code.toLowerCase().includes(q) ||
        r.breed.toLowerCase().includes(q),
    );
  }
  return list.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export class SeedGoatBatchRepository implements GoatBatchRepository {
  async listBatches(farmId: string, filter?: GoatBatchListFilter) {
    const rows = applyFilter(getFarmBatches(farmId), filter);
    const result = await Promise.all(
      rows.map(async (row) => mapGoatBatchRowToDomain(row, await resolveBarnName(farmId, row.barn_id))),
    );
    return result;
  }

  async getBatchById(farmId: string, batchId: string) {
    const row = getFarmBatches(farmId).find((b) => b.id === batchId);
    if (!row) return null;
    return mapGoatBatchRowToDomain(row, await resolveBarnName(farmId, row.barn_id));
  }

  async getBatchByCode(farmId: string, batchCode: string) {
    const row = getFarmBatches(farmId).find(
      (b) => b.batch_code.toLowerCase() === batchCode.toLowerCase(),
    );
    if (!row) return null;
    return mapGoatBatchRowToDomain(row, await resolveBarnName(farmId, row.barn_id));
  }

  async listBatchCodes(farmId: string) {
    return getFarmBatches(farmId).map((b) => b.batch_code);
  }

  async batchCodeExists(farmId: string, batchCode: string) {
    return getFarmBatches(farmId).some(
      (b) => b.batch_code.toLowerCase() === batchCode.toLowerCase(),
    );
  }

  async createBatch(farmId: string, input: CreateGoatBatchInput, nowIso: string) {
    const barn = await barnRepo.getBarnById(farmId, input.barnId);
    if (!barn) throw new AppError("VALIDATION_ERROR", "Chuồng không tồn tại");
    if (await this.batchCodeExists(farmId, input.batchCode)) {
      throw new AppError("VALIDATION_ERROR", "Mã đàn đã tồn tại");
    }
    const id = randomUUID();
    const enriched: CreateGoatBatchInput = {
      ...input,
      developmentStage: input.developmentStage ?? inferDevelopmentStage(input.birthDate),
    };
    const row = mapCreateGoatBatchToRow(farmId, id, enriched, nowIso);
    getFarmBatches(farmId).push(row);
    return mapGoatBatchRowToDomain(row, barn.name);
  }

  async updateBatch(farmId: string, batchId: string, input: UpdateGoatBatchInput, nowIso: string) {
    const rows = getFarmBatches(farmId);
    const idx = rows.findIndex((b) => b.id === batchId);
    if (idx < 0) throw new AppError("NOT_FOUND", "Không tìm thấy lứa");
    const patch = mapUpdateGoatBatchToRow(input, nowIso);
    rows[idx] = { ...rows[idx]!, ...patch } as GoatBatchRow;
    return mapGoatBatchRowToDomain(rows[idx]!, await resolveBarnName(farmId, rows[idx]!.barn_id));
  }
}

export function linkSeedBarnStore(store: Map<string, BarnRow[]>) {
  void store;
}
