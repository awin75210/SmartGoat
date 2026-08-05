import dayjs from "dayjs";
import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { createGoatBatchRepository } from "../repositories/create-goat-batch.repository";
import { createHerdExtendedRepository } from "../repositories/create-herd-extended.repository";
import type { DevelopmentStage } from "../constants/development-stage.constants";
import { addDaysToDate } from "../utils/stage.utils";
import type { CreateJournalEntryInput } from "../types/journal.types";
import type { GoatBatch } from "../types/goat-batch.types";

export class CareReminderService {
  private readonly repo = createHerdExtendedRepository();
  private readonly batchRepo = createGoatBatchRepository();

  async listReminders(farmId: string = DEFAULT_FARM_ID, status?: string) {
    const today = dayjs().format("YYYY-MM-DD");
    await this.repo.markOverdueReminders(farmId, today, new Date().toISOString());
    return this.repo.listReminders(farmId, status);
  }

  async listUpcoming(farmId: string = DEFAULT_FARM_ID, days = 14) {
    const all = await this.listReminders(farmId);
    const until = dayjs().add(days, "day").format("YYYY-MM-DD");
    const today = dayjs().format("YYYY-MM-DD");
    return all.filter(
      (r) =>
        (r.status === "pending" || r.status === "overdue") &&
        r.dueDate >= today &&
        r.dueDate <= until,
    );
  }

  async syncRemindersForBatch(farmId: string, batch: GoatBatch) {
    const templates = await this.repo.listCareTemplates();
    const stage = batch.effectiveStage as DevelopmentStage;
    const existing = await this.repo.listReminders(farmId);
    const existingKeys = new Set(
      existing
        .filter((r) => r.batchId === batch.id)
        .map((r) => `${r.title}-${r.dueDate}`),
    );

    const rows = templates
      .filter((t) => !t.development_stage || t.development_stage === stage)
      .map((t) => {
        const dueDate = addDaysToDate(batch.birthDate, t.offset_days);
        const title = t.title;
        if (existingKeys.has(`${title}-${dueDate}`)) return null;
        return {
          farm_id: farmId,
          template_id: t.id,
          batch_id: batch.id,
          doe_id: null,
          title,
          care_type: t.care_type,
          due_date: dueDate,
          status: "pending" as const,
          completed_journal_id: null,
        };
      })
      .filter(Boolean) as Parameters<typeof this.repo.insertReminders>[0];

    await this.repo.insertReminders(rows);
  }

  async completeReminder(
    farmId: string,
    reminderId: string,
    userId: string,
    journalInput?: Partial<CreateJournalEntryInput>,
  ) {
    const now = new Date().toISOString();
    const reminders = await this.repo.listReminders(farmId);
    const reminder = reminders.find((r) => r.id === reminderId);
    if (!reminder) throw new Error("Reminder not found");

    const journal = await this.repo.createJournal(
      farmId,
      {
        entryType: journalInput?.entryType ?? (reminder.careType === "vaccination" ? "vaccination" : reminder.careType === "deworming" ? "deworming" : reminder.careType === "feeding" ? "feeding" : "health"),
        batchId: reminder.batchId,
        doeId: reminder.doeId,
        title: journalInput?.title ?? `Hoàn thành: ${reminder.title}`,
        body: journalInput?.body ?? null,
        metadata: journalInput?.metadata ?? {},
        recordedAt: now,
      },
      userId,
      now,
    );

    await this.repo.updateReminderStatus(farmId, reminderId, "done", journal.id, now);
    return journal;
  }

  async skipReminder(farmId: string, reminderId: string) {
    await this.repo.updateReminderStatus(farmId, reminderId, "skipped", null, new Date().toISOString());
  }
}

export const careReminderService = new CareReminderService();
