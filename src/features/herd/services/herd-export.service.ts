import { GOAT_BATCH_SOURCE_LABELS } from "../constants/goat-batch.constants";
import { JOURNAL_ENTRY_TYPE_LABELS } from "../constants/journal.constants";
import { REMINDER_STATUS_LABELS } from "../constants/care.constants";
import { createGoatBatchRepository } from "../repositories/create-goat-batch.repository";
import { createHerdExtendedRepository } from "../repositories/create-herd-extended.repository";
import type { TraceabilityReport } from "../types/care.types";
import type { GoatBatch } from "../types/goat-batch.types";

function escapeCsv(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export class HerdExportService {
  private readonly batchRepo = createGoatBatchRepository();
  private readonly extRepo = createHerdExtendedRepository();

  async buildTraceabilityReport(farmId: string, batchId: string): Promise<TraceabilityReport | null> {
    const batch = await this.batchRepo.getBatchById(farmId, batchId);
    if (!batch) return null;

    const [journal, growth, reminders] = await Promise.all([
      this.extRepo.listJournal(farmId, { batchId, limit: 200 }),
      this.extRepo.listGrowthRecords(farmId, batchId),
      this.extRepo.listReminders(farmId),
    ]);

    return {
      batchCode: batch.batchCode,
      batchName: batch.name,
      breed: batch.breed,
      source: GOAT_BATCH_SOURCE_LABELS[batch.source],
      supplierInfo: batch.supplierInfo,
      barnName: batch.barnName ?? batch.barnId,
      birthDate: batch.birthDate,
      quantity: batch.quantity,
      journal: journal.map((j) => ({
        date: j.recordedAt.slice(0, 10),
        type: JOURNAL_ENTRY_TYPE_LABELS[j.entryType],
        title: j.title,
      })),
      growth: growth.map((g) => ({ date: g.recordedAt, weightKg: g.avgWeightKg })),
      reminders: reminders
        .filter((r) => r.batchId === batchId)
        .map((r) => ({
          date: r.dueDate,
          title: r.title,
          status: REMINDER_STATUS_LABELS[r.status],
        })),
    };
  }

  batchesToCsv(batches: GoatBatch[]): string {
    const header = "batch_code,name,breed,source,stage,barn,quantity,birth_date,status";
    const rows = batches.map((b) =>
      [
        escapeCsv(b.batchCode),
        escapeCsv(b.name),
        escapeCsv(b.breed),
        escapeCsv(GOAT_BATCH_SOURCE_LABELS[b.source]),
        escapeCsv(b.effectiveStage),
        escapeCsv(b.barnName ?? b.barnId),
        b.quantity,
        escapeCsv(b.birthDate),
        escapeCsv(b.status),
      ].join(","),
    );
    return [header, ...rows].join("\n");
  }

  journalToCsv(
    entries: Array<{
      recordedAt: string;
      entryType: keyof typeof JOURNAL_ENTRY_TYPE_LABELS;
      title: string;
      batchName?: string;
      doeName?: string;
      body: string | null;
    }>,
  ): string {
    const header = "recorded_at,type,title,batch,doe,body";
    const rows = entries.map((j) =>
      [
        escapeCsv(j.recordedAt.slice(0, 10)),
        escapeCsv(JOURNAL_ENTRY_TYPE_LABELS[j.entryType]),
        escapeCsv(j.title),
        escapeCsv(j.batchName ?? ""),
        escapeCsv(j.doeName ?? ""),
        escapeCsv(j.body),
      ].join(","),
    );
    return [header, ...rows].join("\n");
  }

  traceabilityToCsv(report: TraceabilityReport): string {
    const lines = [
      `# Truy xuất nguồn gốc — ${report.batchCode}`,
      `Tên lứa,${escapeCsv(report.batchName)}`,
      `Giống,${escapeCsv(report.breed)}`,
      `Nguồn gốc,${escapeCsv(report.source)}`,
      `NCC/Chi tiết,${escapeCsv(report.supplierInfo)}`,
      `Chuồng,${escapeCsv(report.barnName)}`,
      `Ngày sinh,${escapeCsv(report.birthDate)}`,
      `Số lượng,${report.quantity}`,
      "",
      "## Nhật ký",
      "date,type,title",
      ...report.journal.map((j) => `${j.date},${escapeCsv(j.type)},${escapeCsv(j.title)}`),
      "",
      "## Cân nặng",
      "date,weight_kg",
      ...report.growth.map((g) => `${g.date},${g.weightKg}`),
      "",
      "## Lịch chăm sóc",
      "due_date,title,status",
      ...report.reminders.map((r) => `${r.date},${escapeCsv(r.title)},${escapeCsv(r.status)}`),
    ];
    return lines.join("\n");
  }
}

export const herdExportService = new HerdExportService();
