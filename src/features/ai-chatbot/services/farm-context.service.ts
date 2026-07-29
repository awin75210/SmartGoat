import { herdService } from "@/features/herd/services/herd.service";
import { iotMonitoringService } from "@/features/iot-monitoring/services/iot-monitoring.service";
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
    const stats = await herdService.getOverviewStats(farmId);
    const sick = await herdService.listGoats(farmId, { healthStatus: "sick" });
    const monitoring = await herdService.listGoats(farmId, { healthStatus: "monitoring" });
    chunks.push(
      `Đàn dê — tổng ${stats.totalGoats} con (đực ${stats.maleCount}, cái ${stats.femaleCount}, dê con ${stats.kidCount}). Khỏe ${stats.healthyCount}, theo dõi ${stats.monitoringCount}, cần chăm ${stats.needsCareCount}.`,
    );
    if (sick.length) {
      chunks.push(
        `Dê đang ốm (${sick.length}): ${sick
          .slice(0, 5)
          .map((g) => `${g.tagCode} (${g.healthStatus})`)
          .join(", ")}.`,
      );
    }
    if (monitoring.length) {
      chunks.push(
        `Dê đang theo dõi (${monitoring.length}): ${monitoring
          .slice(0, 5)
          .map((g) => g.tagCode)
          .join(", ")}.`,
      );
    }
  }

  return chunks.length ? chunks.join("\n") : null;
}
