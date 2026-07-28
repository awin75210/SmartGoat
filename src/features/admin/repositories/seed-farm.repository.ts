import { FARMS_SEED } from "../data/admin.seed";
import { mapFarmRowToDomain } from "../mappers/admin.mapper";
import type { FarmRepository } from "./farm.repository";

export class SeedFarmRepository implements FarmRepository {
  async listFarms() {
    return FARMS_SEED.map(mapFarmRowToDomain);
  }

  async getFarmById(farmId: string) {
    const row = FARMS_SEED.find((f) => f.id === farmId);
    return row ? mapFarmRowToDomain(row) : null;
  }
}
