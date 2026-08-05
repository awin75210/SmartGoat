import type { BreedingDoeStatus, ReproductiveCycleStatus } from "../constants/breeding-doe.constants";

export type BreedingDoeRow = {
  id: string;
  farm_id: string;
  tag_code: string;
  barcode: string;
  name: string;
  breed: string;
  birth_date: string;
  batch_id: string | null;
  barn_id: string | null;
  status: BreedingDoeStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BreedingDoe = {
  id: string;
  farmId: string;
  tagCode: string;
  barcode: string;
  name: string;
  breed: string;
  birthDate: string;
  batchId: string | null;
  barnId: string | null;
  barnName?: string;
  batchName?: string;
  status: BreedingDoeStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  expectedKiddingDate?: string | null;
  activeCycleId?: string | null;
};

export type CreateBreedingDoeInput = {
  name: string;
  breed: string;
  birthDate: string;
  batchId?: string | null;
  barnId?: string | null;
  status?: BreedingDoeStatus;
  notes?: string | null;
};

export type ReproductiveCycleRow = {
  id: string;
  farm_id: string;
  doe_id: string;
  cycle_number: number;
  mating_date: string | null;
  expected_kidding_date: string | null;
  actual_kidding_date: string | null;
  kids_count: number | null;
  status: ReproductiveCycleStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ReproductiveCycle = {
  id: string;
  farmId: string;
  doeId: string;
  cycleNumber: number;
  matingDate: string | null;
  expectedKiddingDate: string | null;
  actualKiddingDate: string | null;
  kidsCount: number | null;
  status: ReproductiveCycleStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecordMatingInput = {
  doeId: string;
  matingDate: string;
  notes?: string | null;
};

export type RecordKiddingInput = {
  cycleId: string;
  actualKiddingDate: string;
  kidsCount: number;
  notes?: string | null;
};
