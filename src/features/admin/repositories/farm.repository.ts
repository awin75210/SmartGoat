import type { Farm } from "../types/admin.types";

export interface FarmRepository {
  listFarms(): Promise<Farm[]>;
  getFarmById(farmId: string): Promise<Farm | null>;
}
