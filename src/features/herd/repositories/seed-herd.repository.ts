import { GOATS_SEED } from "../data/herd.seed";
import { mapGoatRowToDomain } from "../mappers/herd.mapper";
import type { HerdListFilter } from "../types/herd.types";
import type { HerdRepository } from "./herd.repository";

function applyFilter(rows: ReturnType<typeof mapGoatRowToDomain>[], filter?: HerdListFilter) {
  let list = rows;
  if (filter?.gender && filter.gender !== "all") {
    list = list.filter((g) => g.gender === filter.gender);
  }
  if (filter?.healthStatus && filter.healthStatus !== "all") {
    list = list.filter((g) => g.healthStatus === filter.healthStatus);
  }
  if (filter?.search?.trim()) {
    const q = filter.search.trim().toLowerCase();
    list = list.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.tagCode.toLowerCase().includes(q) ||
        g.breed.toLowerCase().includes(q),
    );
  }
  return list;
}

export class SeedHerdRepository implements HerdRepository {
  async listGoats(farmId: string, filter?: HerdListFilter) {
    const rows = GOATS_SEED.filter((r) => r.farm_id === farmId).map(mapGoatRowToDomain);
    return applyFilter(rows, filter);
  }

  async getGoatById(farmId: string, goatId: string) {
    const row = GOATS_SEED.find((r) => r.farm_id === farmId && r.id === goatId);
    return row ? mapGoatRowToDomain(row) : null;
  }
}
