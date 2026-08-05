import type { CareType, ReminderStatus } from "../constants/care.constants";
import type {
  CareReminder,
  CareReminderRow,
  GrowthRecord,
  GrowthRecordRow,
} from "../types/care.types";
import type { CreateGrowthRecordInput } from "../types/growth.types";

function parseCareType(v: unknown): CareType {
  const t = ["vaccination", "deworming", "feeding", "general_care"] as const;
  return t.includes(v as CareType) ? (v as CareType) : "general_care";
}

function parseReminderStatus(v: unknown): ReminderStatus {
  const s = ["pending", "done", "skipped", "overdue"] as const;
  return s.includes(v as ReminderStatus) ? (v as ReminderStatus) : "pending";
}

export function mapCareReminderRowToDomain(
  row: CareReminderRow,
  extras?: { batchName?: string; doeName?: string },
): CareReminder {
  return {
    id: row.id,
    farmId: row.farm_id,
    templateId: row.template_id,
    batchId: row.batch_id,
    doeId: row.doe_id,
    batchName: extras?.batchName,
    doeName: extras?.doeName,
    title: row.title,
    careType: parseCareType(row.care_type),
    dueDate: row.due_date,
    status: parseReminderStatus(row.status),
    completedJournalId: row.completed_journal_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapGrowthRecordRowToDomain(row: GrowthRecordRow): GrowthRecord {
  return {
    id: row.id,
    farmId: row.farm_id,
    batchId: row.batch_id,
    recordedAt: row.recorded_at,
    avgWeightKg: Number(row.avg_weight_kg),
    sampleSize: row.sample_size,
    feedKgPerDay: row.feed_kg_per_day === null ? null : Number(row.feed_kg_per_day),
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function mapCreateGrowthToRow(
  farmId: string,
  id: string,
  input: CreateGrowthRecordInput,
  nowIso: string,
): GrowthRecordRow {
  return {
    id,
    farm_id: farmId,
    batch_id: input.batchId,
    recorded_at: input.recordedAt,
    avg_weight_kg: input.avgWeightKg,
    sample_size: input.sampleSize ?? 1,
    feed_kg_per_day: input.feedKgPerDay ?? null,
    notes: input.notes?.trim() || null,
    created_at: nowIso,
  };
}
