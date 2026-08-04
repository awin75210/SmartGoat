import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { goatBatchService } from "./goat-batch.service";
import type { GoatBatchListFilter, HerdOverviewStats } from "../types/goat-batch.types";
import type { GoatBatch } from "../types/goat-batch.types";

/** Facade for dashboard / IoT consumers */
export class HerdService {
  async listBatches(farmId: string = DEFAULT_FARM_ID, filter?: GoatBatchListFilter): Promise<GoatBatch[]> {
    return goatBatchService.listBatches(farmId, filter);
  }

  async getOverviewStats(farmId: string = DEFAULT_FARM_ID): Promise<HerdOverviewStats> {
    return goatBatchService.getOverviewStats(farmId);
  }
}

export const herdService = new HerdService();
