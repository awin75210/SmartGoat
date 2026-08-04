import { herdService } from "@/features/herd/services/herd.service";
import { iotMonitoringService } from "@/features/iot-monitoring/services/iot-monitoring.service";
import {
  GOAT_BATCH_GENDER_LABELS,
  GOAT_BATCH_STATUS_LABELS,
} from "@/features/herd/constants/goat-batch.constants";
import type { QueryIntent } from "./query-intent.service";

export async function buildFarmContextSnippet(
  farmId: string,
  intent: QueryIntent,
): Promise<string | null> {
  const chunks: string[] = [];

  if (intent.needsIot) {
    const snapshot = await iotMonitoringService.getMonitoringSnapshot(farmId, "24h");
    const env = snapshot.environmentSummary;
    const metrics = snapshot.metrics
      .slice(0, 6)
      .map((m) => `${m.metricKey}: ${m.value}${m.unit} (${m.statusLabel})`)
      .join("; ");
    const barnLine = snapshot.barnStatus
      .slice(0, 3)
      .map((b) => `${b.barnName}: ${b.occupancy}/${b.capacity}, thông gió ${b.ventilation}`)
      .join("; ");
    chunks.push(
      `IoT gần nhất — ${env.healthLabel} (${env.healthPercent}%). Chỉ số: ${metrics}. Chuồng: ${barnLine || "n/a"}.`,
    );
  }

  if (intent.needsHerd) {
    const [stats, batches] = await Promise.all([
      herdService.getOverviewStats(farmId),
      herdService.listBatches(farmId, { status: "active" }),
    ]);
    chunks.push(
      `Đàn/lứa — tổng ${stats.totalQuantity} con, ${stats.activeBatchCount} lứa đang nuôi (${stats.activeQuantity} con), ${stats.barnCount} chuồng. Lứa đực ${stats.maleBatchCount}, cái ${stats.femaleBatchCount}, mixed ${stats.mixedBatchCount}.`,
    );
    if (batches.length) {
      chunks.push(
        `Lứa đang nuôi (${batches.length}): ${batches
          .slice(0, 5)
          .map(
            (b) =>
              `${b.batchCode} — ${b.name}, ${b.quantity} con, ${GOAT_BATCH_GENDER_LABELS[b.gender]}, ${GOAT_BATCH_STATUS_LABELS[b.status]}`,
          )
          .join("; ")}.`,
      );
    }
  }

  return chunks.length ? chunks.join("\n") : null;
}
