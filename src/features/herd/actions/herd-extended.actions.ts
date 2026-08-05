"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { z } from "zod";
import {
  GOAT_BATCH_GENDERS,
  GOAT_BATCH_SOURCES,
  GOAT_BATCH_STATUSES,
} from "../constants/goat-batch.constants";
import { DEVELOPMENT_STAGES } from "../constants/development-stage.constants";
import { JOURNAL_ENTRY_TYPES } from "../constants/journal.constants";
import { schemaPayloadToCreateInput } from "../mappers/goat-batch.mapper";
import { createGoatBatchSchema } from "../schemas/goat-batch.schema";
import { breedingDoeService } from "../services/breeding-doe.service";
import { careReminderService } from "../services/care-reminder.service";
import { goatBatchService } from "../services/goat-batch.service";
import { growthService } from "../services/growth.service";
import { herdExportService } from "../services/herd-export.service";
import { journalService } from "../services/journal.service";
import type { GoatBatch } from "../types/goat-batch.types";
import type { BreedingDoe, ReproductiveCycle } from "../types/breeding-doe.types";
import type { CareReminder } from "../types/care.types";
import type { GrowthRecord } from "../types/growth.types";
import type { JournalEntry } from "../types/journal.types";

const updateBatchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  barn_id: z.string().min(1).optional(),
  breed: z.string().min(1).optional(),
  gender: z.enum(GOAT_BATCH_GENDERS).optional(),
  birth_date: z.coerce.date().optional(),
  quantity: z.number().int().min(1).optional(),
  source: z.enum(GOAT_BATCH_SOURCES).optional(),
  status: z.enum(GOAT_BATCH_STATUSES).optional(),
  development_stage: z.enum(DEVELOPMENT_STAGES).optional(),
  stage_override: z.boolean().optional(),
  supplier_info: z.string().max(500).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

const journalSchema = z.object({
  entry_type: z.enum(JOURNAL_ENTRY_TYPES),
  batch_id: z.string().uuid().nullable().optional(),
  doe_id: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(2).max(200),
  body: z.string().max(2000).nullable().optional(),
});

const breedingDoeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  breed: z.string().trim().min(1),
  birth_date: z.coerce.date(),
  batch_id: z.string().uuid().nullable().optional(),
  barn_id: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

const matingSchema = z.object({
  doe_id: z.string().uuid(),
  mating_date: z.coerce.date(),
  notes: z.string().max(500).nullable().optional(),
});

const kiddingSchema = z.object({
  cycle_id: z.string().uuid(),
  actual_kidding_date: z.coerce.date(),
  kids_count: z.number().int().min(0),
  notes: z.string().max(500).nullable().optional(),
});

const growthSchema = z.object({
  batch_id: z.string().uuid(),
  recorded_at: z.coerce.date(),
  avg_weight_kg: z.number().positive(),
  sample_size: z.number().int().min(1).optional(),
  feed_kg_per_day: z.number().min(0).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function suggestBatchCodeAction(): Promise<ActionResult<{ batchCode: string }>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const batchCode = await goatBatchService.suggestBatchCode(ctx.farmId);
    return { batchCode };
  });
}

export async function createGoatBatchAction(input: unknown): Promise<ActionResult<GoatBatch>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = createGoatBatchSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    }
    const batchCode = await goatBatchService.suggestBatchCode(ctx.farmId);
    const createInput = schemaPayloadToCreateInput({
      ...parsed.data,
      birth_date: parsed.data.birth_date,
      batchCode,
    });
    const batch = await goatBatchService.createBatch(ctx.farmId, createInput);
    revalidatePath("/app/herd");
    return batch;
  });
}

export async function updateGoatBatchAction(
  batchId: string,
  input: unknown,
): Promise<ActionResult<GoatBatch>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = updateBatchSchema.safeParse(input);
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    const d = parsed.data;
    const batch = await goatBatchService.updateBatch(ctx.farmId, batchId, {
      name: d.name,
      barnId: d.barn_id,
      breed: d.breed,
      gender: d.gender,
      birthDate: d.birth_date ? formatDate(d.birth_date) : undefined,
      quantity: d.quantity,
      source: d.source,
      status: d.status,
      developmentStage: d.development_stage,
      stageOverride: d.stage_override,
      supplierInfo: d.supplier_info,
      notes: d.notes,
    });
    revalidatePath("/app/herd");
    revalidatePath(`/app/herd/batches/${batchId}`);
    return batch;
  });
}

export async function createJournalEntryAction(input: unknown): Promise<ActionResult<JournalEntry>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = journalSchema.safeParse(input);
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    const entry = await journalService.createEntry(ctx.farmId, {
      entryType: parsed.data.entry_type,
      batchId: parsed.data.batch_id ?? null,
      doeId: parsed.data.doe_id ?? null,
      title: parsed.data.title,
      body: parsed.data.body ?? null,
    }, ctx.userId);
    revalidatePath("/app/herd");
    return entry;
  });
}

export async function createBreedingDoeAction(input: unknown): Promise<ActionResult<BreedingDoe>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = breedingDoeSchema.safeParse(input);
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    const doe = await breedingDoeService.createDoe(ctx.farmId, {
      name: parsed.data.name,
      breed: parsed.data.breed,
      birthDate: formatDate(parsed.data.birth_date),
      batchId: parsed.data.batch_id ?? null,
      barnId: parsed.data.barn_id ?? null,
      notes: parsed.data.notes ?? null,
    });
    revalidatePath("/app/herd");
    revalidatePath("/app/herd/breeding/new");
    return doe;
  });
}

export async function recordMatingAction(input: unknown): Promise<ActionResult<ReproductiveCycle>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = matingSchema.safeParse(input);
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    const cycle = await breedingDoeService.recordMating(ctx.farmId, ctx.userId, {
      doeId: parsed.data.doe_id,
      matingDate: formatDate(parsed.data.mating_date),
      notes: parsed.data.notes ?? null,
    });
    revalidatePath("/app/herd");
    revalidatePath(`/app/herd/breeding/${parsed.data.doe_id}`);
    return cycle;
  });
}

export async function recordKiddingAction(input: unknown): Promise<ActionResult<ReproductiveCycle>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = kiddingSchema.safeParse(input);
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    const cycle = await breedingDoeService.recordKidding(ctx.farmId, ctx.userId, {
      cycleId: parsed.data.cycle_id,
      actualKiddingDate: formatDate(parsed.data.actual_kidding_date),
      kidsCount: parsed.data.kids_count,
      notes: parsed.data.notes ?? null,
    });
    revalidatePath("/app/herd");
    return cycle;
  });
}

export async function completeReminderAction(reminderId: string): Promise<ActionResult<JournalEntry>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const entry = await careReminderService.completeReminder(ctx.farmId, reminderId, ctx.userId);
    revalidatePath("/app/herd");
    revalidatePath("/app");
    return entry;
  });
}

export async function skipReminderAction(reminderId: string): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    await careReminderService.skipReminder(ctx.farmId, reminderId);
    revalidatePath("/app/herd");
    return undefined;
  });
}

export async function createGrowthRecordAction(input: unknown): Promise<ActionResult<GrowthRecord>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = growthSchema.safeParse(input);
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    const record = await growthService.createRecord(ctx.farmId, {
      batchId: parsed.data.batch_id,
      recordedAt: formatDate(parsed.data.recorded_at),
      avgWeightKg: parsed.data.avg_weight_kg,
      sampleSize: parsed.data.sample_size,
      feedKgPerDay: parsed.data.feed_kg_per_day ?? null,
      notes: parsed.data.notes ?? null,
    });
    revalidatePath(`/app/herd/batches/${parsed.data.batch_id}`);
    return record;
  });
}

export async function exportBatchesCsvAction(): Promise<ActionResult<{ csv: string; filename: string }>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const batches = await goatBatchService.listBatches(ctx.farmId);
    const csv = herdExportService.batchesToCsv(batches);
    return { csv, filename: `dan-de-${ctx.farmId}.csv` };
  });
}

export async function exportTraceabilityCsvAction(
  batchId: string,
): Promise<ActionResult<{ csv: string; filename: string }>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const report = await herdExportService.buildTraceabilityReport(ctx.farmId, batchId);
    if (!report) throw new AppError("NOT_FOUND", "Không tìm thấy lứa");
    const csv = herdExportService.traceabilityToCsv(report);
    return { csv, filename: `truy-xuat-${report.batchCode}.csv` };
  });
}

export async function fetchUpcomingRemindersAction(): Promise<ActionResult<CareReminder[]>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    return careReminderService.listUpcoming(ctx.farmId);
  });
}
