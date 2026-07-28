import { SeedFarmRepository } from "./seed-farm.repository";
import type { FarmRepository } from "./farm.repository";

export function createFarmRepository(): FarmRepository {
  return new SeedFarmRepository();
}
