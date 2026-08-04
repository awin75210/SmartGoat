import type {
  GoatBatchGender,
  GoatBatchSource,
  GoatBatchStatus,
} from "../constants/goat-batch.constants";

export type GoatBatchRow = {
  id: string;
  farm_id: string;
  name: string;
  batch_code: string;
  barn_id: string;
  breed: string;
  gender: GoatBatchGender;
  birth_date: string;
  quantity: number;
  source: GoatBatchSource;
  status: GoatBatchStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type GoatBatch = {
  id: string;
  farmId: string;
  name: string;
  batchCode: string;
  barnId: string;
  barnName?: string;
  breed: string;
  gender: GoatBatchGender;
  birthDate: string;
  quantity: number;
  source: GoatBatchSource;
  status: GoatBatchStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateGoatBatchInput = {
  name: string;
  batchCode: string;
  barnId: string;
  breed: string;
  gender: GoatBatchGender;
  birthDate: string;
  quantity: number;
  source: GoatBatchSource;
  status: GoatBatchStatus;
  notes?: string | null;
};

export type HerdOverviewStats = {
  totalQuantity: number;
  activeBatchCount: number;
  activeQuantity: number;
  barnCount: number;
  maleBatchCount: number;
  femaleBatchCount: number;
  mixedBatchCount: number;
};

export type GoatBatchListFilter = {
  search?: string;
  status?: GoatBatchStatus | "all";
  barnId?: string | "all";
};
