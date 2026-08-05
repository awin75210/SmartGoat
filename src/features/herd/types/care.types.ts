import type { CareType, ReminderStatus } from "../constants/care.constants";
import type { DevelopmentStage } from "../constants/development-stage.constants";

export type CareTemplateRow = {
  id: string;
  farm_id: string | null;
  care_type: CareType;
  development_stage: DevelopmentStage | null;
  title: string;
  description: string | null;
  offset_days: number;
  is_active: boolean;
  created_at: string;
};

export type CareReminderRow = {
  id: string;
  farm_id: string;
  template_id: string | null;
  batch_id: string | null;
  doe_id: string | null;
  title: string;
  care_type: CareType;
  due_date: string;
  status: ReminderStatus;
  completed_journal_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CareReminder = {
  id: string;
  farmId: string;
  templateId: string | null;
  batchId: string | null;
  doeId: string | null;
  batchName?: string;
  doeName?: string;
  title: string;
  careType: CareType;
  dueDate: string;
  status: ReminderStatus;
  completedJournalId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GrowthRecordRow = {
  id: string;
  farm_id: string;
  batch_id: string;
  recorded_at: string;
  avg_weight_kg: number;
  sample_size: number;
  feed_kg_per_day: number | null;
  notes: string | null;
  created_at: string;
};

export type GrowthRecord = {
  id: string;
  farmId: string;
  batchId: string;
  recordedAt: string;
  avgWeightKg: number;
  sampleSize: number;
  feedKgPerDay: number | null;
  notes: string | null;
  createdAt: string;
};

export type CreateGrowthRecordInput = {
  batchId: string;
  recordedAt: string;
  avgWeightKg: number;
  sampleSize?: number;
  feedKgPerDay?: number | null;
  notes?: string | null;
};

export type TraceabilityReport = {
  batchCode: string;
  batchName: string;
  breed: string;
  source: string;
  supplierInfo: string | null;
  barnName: string;
  birthDate: string;
  quantity: number;
  journal: Array<{ date: string; type: string; title: string }>;
  growth: Array<{ date: string; weightKg: number }>;
  reminders: Array<{ date: string; title: string; status: string }>;
};
