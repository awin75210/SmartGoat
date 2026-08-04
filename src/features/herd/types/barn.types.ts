import type { BarnStatus } from "../constants/goat-batch.constants";

export type BarnRow = {
  id: string;
  farm_id: string;
  name: string;
  capacity: number | null;
  status: BarnStatus;
  created_at: string;
  updated_at: string;
};

export type Barn = {
  id: string;
  farmId: string;
  name: string;
  capacity: number | null;
  status: BarnStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateBarnInput = {
  name: string;
  capacity?: number | null;
};

export type UpdateBarnInput = {
  name: string;
  capacity?: number | null;
  status?: BarnStatus;
};
