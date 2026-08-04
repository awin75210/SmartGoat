import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { AppError } from "@/lib/errors/app-error";
import { createGoatBatchRepository } from "../repositories/create-goat-batch.repository";
import { createBarnRepository } from "../repositories/create-barn.repository";
import { nextBatchCode } from "../utils/batch-code.utils";
import {
  getBarnOccupiedQuantity,
  validateBatchQuantity,
} from "../utils/barn-capacity.utils";
import type { CreateGoatBatchInput, GoatBatchListFilter, HerdOverviewStats } from "../types/goat-batch.types";

export class GoatBatchService {
  private readonly repo = createGoatBatchRepository();
  private readonly barnRepo = createBarnRepository();

  listBatches(farmId: string = DEFAULT_FARM_ID, filter?: GoatBatchListFilter) {
    return this.repo.listBatches(farmId, filter);
  }

  getBatch(farmId: string, batchId: string) {
    return this.repo.getBatchById(farmId, batchId);
  }

  async suggestBatchCode(farmId: string = DEFAULT_FARM_ID) {
    const codes = await this.repo.listBatchCodes(farmId);
    return nextBatchCode(codes);
  }

  async createBatch(farmId: string, input: CreateGoatBatchInput) {
    const barn = await this.barnRepo.getBarnById(farmId, input.barnId);
    if (!barn) {
      throw new AppError("NOT_FOUND", "Không tìm thấy chuồng");
    }

    const batches = await this.repo.listBatches(farmId);
    const occupied = getBarnOccupiedQuantity(batches, input.barnId);
    const capacityError = validateBatchQuantity({
      quantity: input.quantity,
      barn,
      occupied,
      status: input.status,
    });
    if (capacityError) {
      throw new AppError("VALIDATION_ERROR", capacityError);
    }

    return this.repo.createBatch(farmId, input, new Date().toISOString());
  }

  async getOverviewStats(farmId: string = DEFAULT_FARM_ID): Promise<HerdOverviewStats> {
    const [batches, barns] = await Promise.all([
      this.repo.listBatches(farmId),
      this.barnRepo.listBarns(farmId),
    ]);

    const activeBatches = batches.filter((b) => b.status === "active");
    return {
      totalQuantity: batches.reduce((sum, b) => sum + b.quantity, 0),
      activeBatchCount: activeBatches.length,
      activeQuantity: activeBatches.reduce((sum, b) => sum + b.quantity, 0),
      barnCount: barns.length,
      maleBatchCount: batches.filter((b) => b.gender === "male").length,
      femaleBatchCount: batches.filter((b) => b.gender === "female").length,
      mixedBatchCount: batches.filter((b) => b.gender === "mixed").length,
    };
  }
}

export const goatBatchService = new GoatBatchService();
