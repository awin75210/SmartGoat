import { randomUUID } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
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
import type { CareReminderRow, CareTemplateRow, GrowthRecordRow } from "../types/care.types";
import type { CreateGrowthRecordInput } from "../types/growth.types";
import type { CreateJournalEntryInput, JournalEntryRow, JournalListFilter } from "../types/journal.types";
import { nextTagCode, tagToBarcode } from "../utils/barcode.utils";
import { expectedKiddingDate } from "../utils/stage.utils";

export class SupabaseHerdExtendedRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  // --- Journal ---
  async listJournal(farmId: string, filter?: JournalListFilter) {
    const supabase = await this.client();
    let query = supabase
      .from("herd_journal_entries")
      .select("*")
      .eq("farm_id", farmId)
      .order("recorded_at", { ascending: false });

    if (filter?.batchId) query = query.eq("batch_id", filter.batchId);
    if (filter?.doeId) query = query.eq("doe_id", filter.doeId);
    if (filter?.entryType && filter.entryType !== "all") query = query.eq("entry_type", filter.entryType);
    if (filter?.fromDate) query = query.gte("recorded_at", filter.fromDate);
    if (filter?.toDate) query = query.lte("recorded_at", `${filter.toDate}T23:59:59.999Z`);
    if (filter?.limit) query = query.limit(filter.limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapJournalRowToDomain(row as JournalEntryRow));
  }

  async createJournal(farmId: string, input: CreateJournalEntryInput, createdBy: string | null, nowIso: string) {
    const supabase = await this.client();
    const id = randomUUID();
    const row = mapCreateJournalToRow(farmId, id, input, createdBy, nowIso);
    const { data, error } = await supabase.from("herd_journal_entries").insert(row).select("*").single();
    if (error) throw error;
    return mapJournalRowToDomain(data as JournalEntryRow);
  }

  // --- Breeding does ---
  async listBreedingDoes(farmId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("breeding_does")
      .select("*")
      .eq("farm_id", farmId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const does = data ?? [];
    const doeIds = does.map((d) => String(d.id));
    const cycles = doeIds.length
      ? await this.listActiveCyclesForDoes(farmId, doeIds)
      : new Map<string, ReproductiveCycleRow>();

    return does.map((row) => {
      const cycle = cycles.get(String(row.id));
      return mapBreedingDoeRowToDomain(row as never, {
        expectedKiddingDate: cycle?.expected_kidding_date ?? null,
      });
    });
  }

  async getBreedingDoe(farmId: string, doeId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("breeding_does")
      .select("*")
      .eq("farm_id", farmId)
      .eq("id", doeId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapBreedingDoeRowToDomain(data as never);
  }

  async listDoeTagCodes(farmId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase.from("breeding_does").select("tag_code").eq("farm_id", farmId);
    if (error) throw error;
    return (data ?? []).map((r) => String(r.tag_code));
  }

  async createBreedingDoe(farmId: string, input: CreateBreedingDoeInput, nowIso: string) {
    const supabase = await this.client();
    const tags = await this.listDoeTagCodes(farmId);
    const tagCode = nextTagCode(farmId, tags);
    const barcode = tagToBarcode(tagCode);
    const id = randomUUID();
    const row = mapCreateDoeToRow(farmId, id, tagCode, barcode, input, nowIso);
    const { data, error } = await supabase.from("breeding_does").insert(row).select("*").single();
    if (error) throw error;
    return mapBreedingDoeRowToDomain(data as never);
  }

  // --- Reproductive cycles ---
  async listCyclesForDoe(farmId: string, doeId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("reproductive_cycles")
      .select("*")
      .eq("farm_id", farmId)
      .eq("doe_id", doeId)
      .order("cycle_number", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapReproductiveCycleRowToDomain(row as ReproductiveCycleRow));
  }

  private async listActiveCyclesForDoes(farmId: string, doeIds: string[]) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("reproductive_cycles")
      .select("*")
      .eq("farm_id", farmId)
      .in("doe_id", doeIds)
      .in("status", ["planned", "pregnant"])
      .order("cycle_number", { ascending: false });
    if (error) throw error;
    const map = new Map<string, ReproductiveCycleRow>();
    for (const row of data ?? []) {
      const did = String(row.doe_id);
      if (!map.has(did)) map.set(did, row as ReproductiveCycleRow);
    }
    return map;
  }

  async recordMating(farmId: string, input: RecordMatingInput, nowIso: string) {
    const supabase = await this.client();
    const cycles = await this.listCyclesForDoe(farmId, input.doeId);
    const cycleNumber = cycles.length ? Math.max(...cycles.map((c) => c.cycleNumber)) + 1 : 1;
    const id = randomUUID();
    const expected = expectedKiddingDate(input.matingDate);
    const { data, error } = await supabase
      .from("reproductive_cycles")
      .insert({
        id,
        farm_id: farmId,
        doe_id: input.doeId,
        cycle_number: cycleNumber,
        mating_date: input.matingDate,
        expected_kidding_date: expected,
        status: "pregnant",
        notes: input.notes ?? null,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("*")
      .single();
    if (error) throw error;

    await supabase
      .from("breeding_does")
      .update({ status: "pregnant", updated_at: nowIso })
      .eq("id", input.doeId)
      .eq("farm_id", farmId);

    return mapReproductiveCycleRowToDomain(data as ReproductiveCycleRow);
  }

  async recordKidding(farmId: string, input: RecordKiddingInput, nowIso: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("reproductive_cycles")
      .update({
        actual_kidding_date: input.actualKiddingDate,
        kids_count: input.kidsCount,
        status: "kidded",
        notes: input.notes ?? null,
        updated_at: nowIso,
      })
      .eq("id", input.cycleId)
      .eq("farm_id", farmId)
      .select("*")
      .single();
    if (error) throw error;

    const cycle = data as ReproductiveCycleRow;
    await supabase
      .from("breeding_does")
      .update({ status: "lactating", updated_at: nowIso })
      .eq("id", cycle.doe_id)
      .eq("farm_id", farmId);

    return mapReproductiveCycleRowToDomain(cycle);
  }

  // --- Care reminders ---
  async listCareTemplates() {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("care_schedule_templates")
      .select("*")
      .eq("is_active", true);
    if (error) throw error;
    return (data ?? []) as CareTemplateRow[];
  }

  async listReminders(farmId: string, status?: string) {
    const supabase = await this.client();
    let query = supabase
      .from("care_reminders")
      .select("*")
      .eq("farm_id", farmId)
      .order("due_date", { ascending: true });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapCareReminderRowToDomain(row as CareReminderRow));
  }

  async insertReminders(rows: Omit<CareReminderRow, "id" | "created_at" | "updated_at">[]) {
    if (!rows.length) return;
    const supabase = await this.client();
    const now = new Date().toISOString();
    const payload = rows.map((r) => ({
      ...r,
      id: randomUUID(),
      created_at: now,
      updated_at: now,
    }));
    const { error } = await supabase.from("care_reminders").insert(payload);
    if (error) throw error;
  }

  async updateReminderStatus(
    farmId: string,
    reminderId: string,
    status: string,
    journalId: string | null,
    nowIso: string,
  ) {
    const supabase = await this.client();
    const { error } = await supabase
      .from("care_reminders")
      .update({ status, completed_journal_id: journalId, updated_at: nowIso })
      .eq("id", reminderId)
      .eq("farm_id", farmId);
    if (error) throw error;
  }

  async markOverdueReminders(farmId: string, today: string, nowIso: string) {
    const supabase = await this.client();
    await supabase
      .from("care_reminders")
      .update({ status: "overdue", updated_at: nowIso })
      .eq("farm_id", farmId)
      .eq("status", "pending")
      .lt("due_date", today);
  }

  // --- Growth ---
  async listGrowthRecords(farmId: string, batchId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("growth_records")
      .select("*")
      .eq("farm_id", farmId)
      .eq("batch_id", batchId)
      .order("recorded_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapGrowthRecordRowToDomain(row as GrowthRecordRow));
  }

  async createGrowthRecord(farmId: string, input: CreateGrowthRecordInput, nowIso: string) {
    const supabase = await this.client();
    const id = randomUUID();
    const row = mapCreateGrowthToRow(farmId, id, input, nowIso);
    const { data, error } = await supabase.from("growth_records").insert(row).select("*").single();
    if (error) throw error;
    return mapGrowthRecordRowToDomain(data as GrowthRecordRow);
  }
}

export const supabaseHerdExtendedRepository = new SupabaseHerdExtendedRepository();
