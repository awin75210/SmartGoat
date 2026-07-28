import { SeedHandbookRepository } from "./seed-handbook.repository";
import type { HandbookRepository } from "./handbook.repository";

export function createHandbookRepository(): HandbookRepository {
  return new SeedHandbookRepository();
}
