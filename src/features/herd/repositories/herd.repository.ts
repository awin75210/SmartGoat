import type { Goat, HerdListFilter } from "../types/herd.types";

export interface HerdRepository {
  listGoats(farmId: string, filter?: HerdListFilter): Promise<Goat[]>;
  getGoatById(farmId: string, goatId: string): Promise<Goat | null>;
}
