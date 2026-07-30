import type { Farm, CreateFarmRowInput } from "../types/admin.types";

export interface FarmRepository {
  listFarms(): Promise<Farm[]>;
  getFarmById(farmId: string): Promise<Farm | null>;
  createFarm(input: CreateFarmRowInput): Promise<Farm>;
  deleteFarm(farmId: string): Promise<void>;
}
