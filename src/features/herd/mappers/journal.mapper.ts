import type { JournalEntryType } from "../constants/journal.constants";
import type { CreateJournalEntryInput, JournalEntry, JournalEntryRow } from "../types/journal.types";

function parseEntryType(v: unknown): JournalEntryType {
  const types = [
    "note", "vaccination", "deworming", "feeding", "weight", "movement", "reproduction", "health",
  ] as const;
  return types.includes(v as JournalEntryType) ? (v as JournalEntryType) : "note";
}

export function mapJournalRowToDomain(
  row: JournalEntryRow,
  extras?: { batchName?: string; doeName?: string },
): JournalEntry {
  return {
    id: row.id,
    farmId: row.farm_id,
    entryType: parseEntryType(row.entry_type),
    batchId: row.batch_id,
    doeId: row.doe_id,
    batchName: extras?.batchName,
    doeName: extras?.doeName,
    title: row.title,
    body: row.body,
    metadata: row.metadata ?? {},
    recordedAt: row.recorded_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCreateJournalToRow(
  farmId: string,
  id: string,
  input: CreateJournalEntryInput,
  createdBy: string | null,
  nowIso: string,
): JournalEntryRow {
  return {
    id,
    farm_id: farmId,
    entry_type: input.entryType,
    batch_id: input.batchId ?? null,
    doe_id: input.doeId ?? null,
    title: input.title.trim(),
    body: input.body?.trim() || null,
    metadata: input.metadata ?? {},
    recorded_at: input.recordedAt ?? nowIso,
    created_by: createdBy,
    created_at: nowIso,
    updated_at: nowIso,
  };
}
