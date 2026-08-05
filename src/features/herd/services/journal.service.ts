import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { createHerdExtendedRepository } from "../repositories/create-herd-extended.repository";
import type { CreateJournalEntryInput, JournalListFilter } from "../types/journal.types";

export class JournalService {
  private readonly repo = createHerdExtendedRepository();

  listEntries(farmId: string = DEFAULT_FARM_ID, filter?: JournalListFilter) {
    return this.repo.listJournal(farmId, filter);
  }

  createEntry(
    farmId: string,
    input: CreateJournalEntryInput,
    createdBy: string | null,
    nowIso = new Date().toISOString(),
  ) {
    return this.repo.createJournal(farmId, input, createdBy, nowIso);
  }
}

export const journalService = new JournalService();
