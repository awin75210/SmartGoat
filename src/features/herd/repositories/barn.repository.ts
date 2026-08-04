import type { Barn, CreateBarnInput, UpdateBarnInput } from "../types/barn.types";

export interface BarnRepository {
  listBarns(farmId: string): Promise<Barn[]>;
  getBarnById(farmId: string, barnId: string): Promise<Barn | null>;
  createBarn(farmId: string, input: CreateBarnInput, nowIso: string): Promise<Barn>;
  updateBarn(
    farmId: string,
    barnId: string,
    input: UpdateBarnInput,
    nowIso: string,
  ): Promise<Barn>;
}
