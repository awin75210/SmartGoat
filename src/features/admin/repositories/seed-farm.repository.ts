import {
  farmsStore,
  removeFarmFromStore,
} from "../data/admin.store";
import { mapFarmRowToDomain } from "../mappers/admin.mapper";
import type { CreateFarmRowInput } from "../types/admin.types";
import type { FarmRepository } from "./farm.repository";

export class SeedFarmRepository implements FarmRepository {
  async listFarms() {
    return farmsStore.map(mapFarmRowToDomain);
  }

  async getFarmById(farmId: string) {
    const row = farmsStore.find((f) => f.id === farmId);
    return row ? mapFarmRowToDomain(row) : null;
  }

  async createFarm(input: CreateFarmRowInput) {
    const row = {
      id: input.id,
      name: input.name,
      owner_email: input.ownerEmail,
      location: input.location,
      goat_count: input.goatCount ?? 0,
      device_count: 0,
      status: "active" as const,
      updated_at: input.nowIso,
    };
    farmsStore.push(row);
    return mapFarmRowToDomain(row);
  }

  async deleteFarm(farmId: string) {
    removeFarmFromStore(farmId);
  }
}
