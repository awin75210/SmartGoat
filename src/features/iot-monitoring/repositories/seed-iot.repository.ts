import {
  BARN_STATUS_SEED,
  IOT_CHART_SEED,
  IOT_ENVIRONMENT_SUMMARY_SEED,
  IOT_HERD_DISPLAY_SUMMARY,
  IOT_METRICS_SEED,
  IOT_SPARKLINE_SEED,
} from "../data/iot.seed";
import type { IotMetricKey, IotTimeRange } from "../types/iot.types";
import {
  mapBarnStatusRowToDomain,
  mapEnvironmentSummaryRowToDomain,
  mapIotChartRowToDomain,
  mapIotMetricRowToDomain,
  mapSparklineRowToDomain,
} from "../mappers/iot.mapper";
import type { IotRepository } from "./iot.repository";

function filterByRange<T extends { recorded_at: string }>(rows: T[], range: IotTimeRange): T[] {
  const ref = new Date("2025-07-21T08:00:00.000Z").getTime();
  const ms =
    range === "24h" ? 24 * 60 * 60 * 1000 : range === "7d" ? 7 * 86400000 : 30 * 86400000;
  const from = ref - ms;
  return rows.filter((r) => new Date(r.recorded_at).getTime() >= from);
}

export class SeedIotRepository implements IotRepository {
  async getMetrics(farmId: string) {
    return IOT_METRICS_SEED.filter((r) => r.farm_id === farmId).map(mapIotMetricRowToDomain);
  }

  async getSparklines(farmId: string) {
    const keys: IotMetricKey[] = ["temperature", "humidity", "airQuality", "light", "ammonia"];
    const result = {} as Record<IotMetricKey, ReturnType<typeof mapSparklineRowToDomain>[]>;
    for (const key of keys) {
      result[key] = IOT_SPARKLINE_SEED.filter(
        (r) => r.farm_id === farmId && r.metric_key === key,
      ).map(mapSparklineRowToDomain);
    }
    return result;
  }

  async getChartSeries(farmId: string, range: IotTimeRange) {
    const rows = filterByRange(
      IOT_CHART_SEED.filter((r) => r.farm_id === farmId),
      range,
    );
    return rows.map(mapIotChartRowToDomain);
  }

  async getBarnStatus(farmId: string) {
    return BARN_STATUS_SEED.filter((r) => r.farm_id === farmId).map(mapBarnStatusRowToDomain);
  }

  async getHerdDisplaySummary(farmId: string) {
    if (farmId !== IOT_METRICS_SEED[0]?.farm_id) {
      return { total: 0, monitoring: 0, newKids: 0 };
    }
    return { ...IOT_HERD_DISPLAY_SUMMARY };
  }

  async getEnvironmentSummary(farmId: string) {
    if (farmId !== IOT_ENVIRONMENT_SUMMARY_SEED.farm_id) {
      return mapEnvironmentSummaryRowToDomain({
        farm_id: farmId,
        health_percent: 0,
        health_label: "—",
        ventilation_status: "—",
        floor_status: "—",
        sensors_status: "—",
      });
    }
    return mapEnvironmentSummaryRowToDomain(IOT_ENVIRONMENT_SUMMARY_SEED);
  }
}
