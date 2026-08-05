import { randomUUID } from "crypto";
import {
  mapBreedingDoeRowToDomain,
  mapCreateDoeToRow,
  mapReproductiveCycleRowToDomain,
} from "../mappers/breeding-doe.mapper";
import {
  mapCareReminderRowToDomain,
  mapCreateGrowthToRow,
  mapGrowthRecordRowToDomain,
} from "../mappers/care.mapper";
import { mapCreateJournalToRow, mapJournalRowToDomain } from "../mappers/journal.mapper";
import type {
  CreateBreedingDoeInput,
  RecordKiddingInput,
  RecordMatingInput,
  ReproductiveCycleRow,
} from "../types/breeding-doe.types";
import type { CareReminderRow, GrowthRecordRow } from "../types/care.types";
import type { CreateGrowthRecordInput } from "../types/growth.types";
import type { CreateJournalEntryInput, JournalEntryRow, JournalListFilter } from "../types/journal.types";
import { nextTagCode, tagToBarcode } from "../utils/barcode.utils";
import { expectedKiddingDate } from "../utils/stage.utils";
import {
  getBreedingDoes,
  getCareReminders,
  getCareTemplates,
  getGrowthRecords,
  getJournalEntries,
  getReproductiveCycles,
} from "../data/herd-extended.store";

export class SeedHerdExtendedRepository {
  async listJournal(farmId: string, filter?: JournalListFilter) {
    let rows = [...getJournalEntries(farmId)];
    if (filter?.batchId) rows = rows.filter((r) => r.batch_id === filter.batchId);
    if (filter?.doeId) rows = rows.filter((r) => r.doe_id === filter.doeId);
    if (filter?.entryType && filter.entryType !== "all") rows = rows.filter((r) => r.entry_type === filter.entryType);
    if (filter?.limit) rows = rows.slice(0, filter.limit);
    rows.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    return rows.map((row) => mapJournalRowToDomain(row));
  }

  async createJournal(farmId: string, input: CreateJournalEntryInput, createdBy: string | null, nowIso: string) {
    const id = randomUUID();
    const row = mapCreateJournalToRow(farmId, id, input, createdBy, nowIso);
    getJournalEntries(farmId).push(row);
    return mapJournalRowToDomain(row);
  }

  async listBreedingDoes(farmId: string) {
    const does = getBreedingDoes(farmId);
    const cycles = getReproductiveCycles(farmId).filter((c) => c.status === "pregnant" || c.status === "planned");
    return does.map((row) => {
      const cycle = cycles.find((c) => c.doe_id === row.id);
      return mapBreedingDoeRowToDomain(row, { expectedKiddingDate: cycle?.expected_kidding_date ?? null });
    });
  }

  async getBreedingDoe(farmId: string, doeId: string) {
    const row = getBreedingDoes(farmId).find((d) => d.id === doeId);
    return row ? mapBreedingDoeRowToDomain(row) : null;
  }

  async listDoeTagCodes(farmId: string) {
    return getBreedingDoes(farmId).map((d) => d.tag_code);
  }

  async createBreedingDoe(farmId: string, input: CreateBreedingDoeInput, nowIso: string) {
    const tagCode = nextTagCode(farmId, await this.listDoeTagCodes(farmId));
    const id = randomUUID();
    const row = mapCreateDoeToRow(farmId, id, tagCode, tagToBarcode(tagCode), input, nowIso);
    getBreedingDoes(farmId).push(row);
    return mapBreedingDoeRowToDomain(row);
  }

  async listCyclesForDoe(farmId: string, doeId: string) {
    return getReproductiveCycles(farmId)
      .filter((c) => c.doe_id === doeId)
      .map(mapReproductiveCycleRowToDomain);
  }

  async recordMating(farmId: string, input: RecordMatingInput, nowIso: string) {
    const cycles = getReproductiveCycles(farmId).filter((c) => c.doe_id === input.doeId);
    const cycleNumber = cycles.length ? Math.max(...cycles.map((c) => c.cycle_number)) + 1 : 1;
    const row: ReproductiveCycleRow = {
      id: randomUUID(),
      farm_id: farmId,
      doe_id: input.doeId,
      cycle_number: cycleNumber,
      mating_date: input.matingDate,
      expected_kidding_date: expectedKiddingDate(input.matingDate),
      actual_kidding_date: null,
      kids_count: null,
      status: "pregnant",
      notes: input.notes ?? null,
      created_at: nowIso,
      updated_at: nowIso,
    };
    getReproductiveCycles(farmId).push(row);
    const doe = getBreedingDoes(farmId).find((d) => d.id === input.doeId);
    if (doe) {
      doe.status = "pregnant";
      doe.updated_at = nowIso;
    }
    return mapReproductiveCycleRowToDomain(row);
  }

  async recordKidding(farmId: string, input: RecordKiddingInput, nowIso: string) {
    const cycle = getReproductiveCycles(farmId).find((c) => c.id === input.cycleId);
    if (!cycle) throw new Error("Cycle not found");
    cycle.actual_kidding_date = input.actualKiddingDate;
    cycle.kids_count = input.kidsCount;
    cycle.status = "kidded";
    cycle.notes = input.notes ?? null;
    cycle.updated_at = nowIso;
    const doe = getBreedingDoes(farmId).find((d) => d.id === cycle.doe_id);
    if (doe) {
      doe.status = "lactating";
      doe.updated_at = nowIso;
    }
    return mapReproductiveCycleRowToDomain(cycle);
  }

  async listCareTemplates() {
    return getCareTemplates();
  }

  async listReminders(farmId: string, status?: string) {
    let rows = getCareReminders(farmId);
    if (status) rows = rows.filter((r) => r.status === status);
    return rows.map((row) => mapCareReminderRowToDomain(row));
  }

  async insertReminders(rows: Omit<CareReminderRow, "id" | "created_at" | "updated_at">[]) {
    const now = new Date().toISOString();
    for (const r of rows) {
      getCareReminders(r.farm_id).push({
        ...r,
        id: randomUUID(),
        created_at: now,
        updated_at: now,
      });
    }
  }

  async updateReminderStatus(farmId: string, reminderId: string, status: string, journalId: string | null, nowIso: string) {
    const row = getCareReminders(farmId).find((r) => r.id === reminderId);
    if (row) {
      row.status = status as CareReminderRow["status"];
      row.completed_journal_id = journalId;
      row.updated_at = nowIso;
    }
  }

  async markOverdueReminders(farmId: string, today: string, nowIso: string) {
    for (const row of getCareReminders(farmId)) {
      if (row.status === "pending" && row.due_date < today) {
        row.status = "overdue";
        row.updated_at = nowIso;
      }
    }
  }

  async listGrowthRecords(farmId: string, batchId: string) {
    return getGrowthRecords(farmId)
      .filter((r) => r.batch_id === batchId)
      .map(mapGrowthRecordRowToDomain);
  }

  async createGrowthRecord(farmId: string, input: CreateGrowthRecordInput, nowIso: string) {
    const id = randomUUID();
    const row = mapCreateGrowthToRow(farmId, id, input, nowIso);
    getGrowthRecords(farmId).push(row);
    return mapGrowthRecordRowToDomain(row);
  }
}

export const seedHerdExtendedRepository = new SeedHerdExtendedRepository();
