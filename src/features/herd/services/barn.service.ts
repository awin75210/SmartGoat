import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { createBarnRepository } from "../repositories/create-barn.repository";
import type { CreateBarnInput, UpdateBarnInput } from "../types/barn.types";

export class BarnService {
  private readonly repo = createBarnRepository();

  listBarns(farmId: string = DEFAULT_FARM_ID) {
    return this.repo.listBarns(farmId);
  }

  getBarn(farmId: string, barnId: string) {
    return this.repo.getBarnById(farmId, barnId);
  }

  createBarn(farmId: string, input: CreateBarnInput) {
    return this.repo.createBarn(farmId, input, new Date().toISOString());
  }

  updateBarn(farmId: string, barnId: string, input: UpdateBarnInput) {
    return this.repo.updateBarn(farmId, barnId, input, new Date().toISOString());
  }
}

export const barnService = new BarnService();
