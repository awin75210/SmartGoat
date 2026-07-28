import { SeedHerdRepository } from "./seed-herd.repository";
import type { HerdRepository } from "./herd.repository";

export function createHerdRepository(): HerdRepository {
  return new SeedHerdRepository();
}
