import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { AppError } from "@/lib/errors/app-error";
import { createHerdExtendedRepository } from "../repositories/create-herd-extended.repository";
import type {
  CreateBreedingDoeInput,
  RecordKiddingInput,
  RecordMatingInput,
} from "../types/breeding-doe.types";
import type { CreateJournalEntryInput } from "../types/journal.types";
import { JOURNAL_ENTRY_TYPE_LABELS } from "../constants/journal.constants";

export class BreedingDoeService {
  private readonly repo = createHerdExtendedRepository();

  listDoes(farmId: string = DEFAULT_FARM_ID) {
    return this.repo.listBreedingDoes(farmId);
  }

  getDoe(farmId: string, doeId: string) {
    return this.repo.getBreedingDoe(farmId, doeId);
  }

  listCycles(farmId: string, doeId: string) {
    return this.repo.listCyclesForDoe(farmId, doeId);
  }

  async createDoe(farmId: string, input: CreateBreedingDoeInput) {
    const now = new Date().toISOString();
    return this.repo.createBreedingDoe(farmId, input, now);
  }

  async recordMating(farmId: string, userId: string, input: RecordMatingInput) {
    const now = new Date().toISOString();
    const cycle = await this.repo.recordMating(farmId, input, now);
    await this.repo.createJournal(
      farmId,
      {
        entryType: "reproduction",
        doeId: input.doeId,
        title: "Ghi nhận phối giống",
        body: input.notes ?? null,
        metadata: { matingDate: input.matingDate, expectedKiddingDate: cycle.expectedKiddingDate },
        recordedAt: now,
      },
      userId,
      now,
    );
    return cycle;
  }

  async recordKidding(farmId: string, userId: string, input: RecordKiddingInput) {
    const now = new Date().toISOString();
    const cycle = await this.repo.recordKidding(farmId, input, now);
    await this.repo.createJournal(
      farmId,
      {
        entryType: "reproduction",
        doeId: cycle.doeId,
        title: `Ghi nhận đẻ — ${input.kidsCount} con`,
        body: input.notes ?? null,
        metadata: { kidsCount: input.kidsCount, actualKiddingDate: input.actualKiddingDate },
        recordedAt: now,
      },
      userId,
      now,
    );
    return cycle;
  }
}

export const breedingDoeService = new BreedingDoeService();

export { JOURNAL_ENTRY_TYPE_LABELS };
