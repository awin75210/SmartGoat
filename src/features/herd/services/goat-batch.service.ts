import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { AppError } from "@/lib/errors/app-error";
import { createGoatBatchRepository } from "../repositories/create-goat-batch.repository";
import { createBarnRepository } from "../repositories/create-barn.repository";
import { nextBatchCode } from "../utils/batch-code.utils";
import {
  getBarnOccupiedQuantity,
  validateBatchQuantity,
} from "../utils/barn-capacity.utils";
import { inferDevelopmentStage } from "../utils/stage.utils";
import { careReminderService } from "./care-reminder.service";
import { createHerdExtendedRepository } from "../repositories/create-herd-extended.repository";
import type {
  CreateGoatBatchInput,
  GoatBatchListFilter,
  HerdOverviewStats,
  UpdateGoatBatchInput,
} from "../types/goat-batch.types";

export class GoatBatchService {
  private readonly repo = createGoatBatchRepository();
  private readonly barnRepo = createBarnRepository();
  private readonly extRepo = createHerdExtendedRepository();

  listBatches(farmId: string = DEFAULT_FARM_ID, filter?: GoatBatchListFilter) {
    return this.repo.listBatches(farmId, filter);
  }

  getBatch(farmId: string, batchId: string) {
    return this.repo.getBatchById(farmId, batchId);
  }

  getBatchByCode(farmId: string, batchCode: string) {
    return this.repo.getBatchByCode(farmId, batchCode);
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

    const enriched: CreateGoatBatchInput = {
      ...input,
      developmentStage: input.developmentStage ?? inferDevelopmentStage(input.birthDate),
    };
    const batch = await this.repo.createBatch(farmId, enriched, new Date().toISOString());
    await careReminderService.syncRemindersForBatch(farmId, batch);
    return batch;
  }

  async updateBatch(farmId: string, batchId: string, input: UpdateGoatBatchInput) {
    const existing = await this.repo.getBatchById(farmId, batchId);
    if (!existing) throw new AppError("NOT_FOUND", "Không tìm thấy lứa");

    if (input.barnId || input.quantity !== undefined || input.status) {
      const barnId = input.barnId ?? existing.barnId;
      const barn = await this.barnRepo.getBarnById(farmId, barnId);
      if (!barn) throw new AppError("NOT_FOUND", "Không tìm thấy chuồng");
      const batches = await this.repo.listBatches(farmId);
      const occupied = getBarnOccupiedQuantity(batches, barnId, batchId);
      const capacityError = validateBatchQuantity({
        quantity: input.quantity ?? existing.quantity,
        barn,
        occupied,
        status: input.status ?? existing.status,
      });
      if (capacityError) throw new AppError("VALIDATION_ERROR", capacityError);
    }

    const batch = await this.repo.updateBatch(farmId, batchId, input, new Date().toISOString());
    if (input.birthDate || input.developmentStage !== undefined) {
      await careReminderService.syncRemindersForBatch(farmId, batch);
    }
    return batch;
  }

  async getOverviewStats(farmId: string = DEFAULT_FARM_ID): Promise<HerdOverviewStats> {
    const [batches, barns, does, reminders] = await Promise.all([
      this.repo.listBatches(farmId),
      this.barnRepo.listBarns(farmId),
      this.extRepo.listBreedingDoes(farmId),
      this.extRepo.listReminders(farmId, "pending"),
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
      breedingDoeCount: does.length,
      pendingReminderCount: reminders.length,
    };
  }
}

export const goatBatchService = new GoatBatchService();
