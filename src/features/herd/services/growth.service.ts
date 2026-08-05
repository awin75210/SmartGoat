import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { createHerdExtendedRepository } from "../repositories/create-herd-extended.repository";
import { createGoatBatchRepository } from "../repositories/create-goat-batch.repository";
import { computeGrowthProjection } from "../utils/growth-projection.utils";
import type { CreateGrowthRecordInput } from "../types/growth.types";

const DEFAULT_TARGET_WEIGHT_KG = 35;

export class GrowthService {
  private readonly repo = createHerdExtendedRepository();
  private readonly batchRepo = createGoatBatchRepository();

  listRecords(farmId: string, batchId: string) {
    return this.repo.listGrowthRecords(farmId, batchId);
  }

  createRecord(farmId: string, input: CreateGrowthRecordInput) {
    return this.repo.createGrowthRecord(farmId, input, new Date().toISOString());
  }

  async getProjection(farmId: string = DEFAULT_FARM_ID, batchId: string, targetWeightKg = DEFAULT_TARGET_WEIGHT_KG) {
    const [records, batch] = await Promise.all([
      this.repo.listGrowthRecords(farmId, batchId),
      this.batchRepo.getBatchById(farmId, batchId),
    ]);
    if (!batch) return null;
    return computeGrowthProjection(records, targetWeightKg, batch.quantity);
  }
}

export const growthService = new GrowthService();
