import { AppError } from "@/lib/errors/app-error";
import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { createHerdRepository } from "../repositories/create-herd.repository";
import type { Goat, HerdListFilter, HerdOverviewStats } from "../types/herd.types";

export class HerdService {
  private readonly repo = createHerdRepository();

  async listGoats(farmId: string = DEFAULT_FARM_ID, filter?: HerdListFilter): Promise<Goat[]> {
    return this.repo.listGoats(farmId, filter);
  }

  async getGoat(farmId: string, goatId: string): Promise<Goat> {
    const goat = await this.repo.getGoatById(farmId, goatId);
    if (!goat) {
      throw new AppError("NOT_FOUND");
    }
    return goat;
  }

  async getOverviewStats(farmId: string = DEFAULT_FARM_ID): Promise<HerdOverviewStats> {
    const goats = await this.repo.listGoats(farmId);
    const kidCutoff = new Date("2024-07-21T00:00:00.000Z");
    return {
      totalGoats: goats.length,
      maleCount: goats.filter((g) => g.gender === "male").length,
      femaleCount: goats.filter((g) => g.gender === "female").length,
      kidCount: goats.filter((g) => new Date(g.birthDate) > kidCutoff).length,
      pregnantCount: goats.filter((g) => g.notes?.toLowerCase().includes("mang thai")).length,
      healthyCount: goats.filter((g) => g.healthStatus === "healthy").length,
      monitoringCount: goats.filter((g) => g.healthStatus === "monitoring").length,
      needsCareCount: goats.filter(
        (g) => g.healthStatus === "sick" || g.healthStatus === "recovering",
      ).length,
    };
  }
}

export const herdService = new HerdService();
