import type {
  CreateGoatBatchInput,
  GoatBatch,
  GoatBatchListFilter,
  UpdateGoatBatchInput,
} from "../types/goat-batch.types";

export interface GoatBatchRepository {
  listBatches(farmId: string, filter?: GoatBatchListFilter): Promise<GoatBatch[]>;
  getBatchById(farmId: string, batchId: string): Promise<GoatBatch | null>;
  getBatchByCode(farmId: string, batchCode: string): Promise<GoatBatch | null>;
  listBatchCodes(farmId: string): Promise<string[]>;
  createBatch(farmId: string, input: CreateGoatBatchInput, nowIso: string): Promise<GoatBatch>;
  updateBatch(farmId: string, batchId: string, input: UpdateGoatBatchInput, nowIso: string): Promise<GoatBatch>;
  batchCodeExists(farmId: string, batchCode: string): Promise<boolean>;
}
