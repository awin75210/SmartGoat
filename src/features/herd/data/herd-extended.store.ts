import type { BreedingDoeRow, ReproductiveCycleRow } from "../types/breeding-doe.types";
import type { CareReminderRow, CareTemplateRow, GrowthRecordRow } from "../types/care.types";
import type { JournalEntryRow } from "../types/journal.types";

export const journalStore = new Map<string, JournalEntryRow[]>();
export const breedingDoeStore = new Map<string, BreedingDoeRow[]>();
export const reproductiveCycleStore = new Map<string, ReproductiveCycleRow[]>();
export const careReminderStore = new Map<string, CareReminderRow[]>();
export const careTemplateStore: CareTemplateRow[] = [
  {
    id: "tpl-deworm-1",
    farm_id: null,
    care_type: "deworming",
    development_stage: "newborn",
    title: "Tẩy giun lần 1",
    description: "Tẩy giun sơ bộ cho dê con 0–30 ngày",
    offset_days: 30,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "tpl-vacc-1",
    farm_id: null,
    care_type: "vaccination",
    development_stage: "weaning",
    title: "Tiêm phòng cơ bản",
    description: "Tiêm phòng bệnh đường ruột",
    offset_days: 60,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];
export const growthRecordStore = new Map<string, GrowthRecordRow[]>();

function farmList<T>(store: Map<string, T[]>, farmId: string): T[] {
  if (!store.has(farmId)) store.set(farmId, []);
  return store.get(farmId)!;
}

export function getJournalEntries(farmId: string) {
  return farmList(journalStore, farmId);
}

export function getBreedingDoes(farmId: string) {
  return farmList(breedingDoeStore, farmId);
}

export function getReproductiveCycles(farmId: string) {
  return farmList(reproductiveCycleStore, farmId);
}

export function getCareReminders(farmId: string) {
  return farmList(careReminderStore, farmId);
}

export function getGrowthRecords(farmId: string) {
  return farmList(growthRecordStore, farmId);
}

export function getCareTemplates() {
  return careTemplateStore.filter((t) => t.is_active);
}
