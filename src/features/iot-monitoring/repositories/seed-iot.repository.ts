import {
  barnStatusStore,
  getEnvironmentForFarm,
  getHerdForFarm,
  iotChartStore,
  iotMetricsStore,
  iotSparklinesStore,
} from "../data/iot.store";
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
    return iotMetricsStore.filter((r) => r.farm_id === farmId).map(mapIotMetricRowToDomain);
  }

  async getSparklines(farmId: string) {
    const keys: IotMetricKey[] = ["temperature", "humidity", "airQuality", "light", "ammonia"];
    const result = {} as Record<IotMetricKey, ReturnType<typeof mapSparklineRowToDomain>[]>;
    for (const key of keys) {
      result[key] = iotSparklinesStore
        .filter((r) => r.farm_id === farmId && r.metric_key === key)
        .map(mapSparklineRowToDomain);
    }
    return result;
  }

  async getChartSeries(farmId: string, range: IotTimeRange) {
    const rows = filterByRange(
      iotChartStore.filter((r) => r.farm_id === farmId),
      range,
    );
    return rows.map(mapIotChartRowToDomain);
  }

  async getBarnStatus(farmId: string) {
    return barnStatusStore.filter((r) => r.farm_id === farmId).map(mapBarnStatusRowToDomain);
  }

  async getHerdDisplaySummary(farmId: string) {
    return getHerdForFarm(farmId);
  }

  async getEnvironmentSummary(farmId: string) {
    const row = getEnvironmentForFarm(farmId);
    if (!row) {
      return mapEnvironmentSummaryRowToDomain({
        farm_id: farmId,
        health_percent: 0,
        health_label: "—",
        ventilation_status: "—",
        floor_status: "—",
        sensors_status: "—",
      });
    }
    return mapEnvironmentSummaryRowToDomain(row);
  }
}
