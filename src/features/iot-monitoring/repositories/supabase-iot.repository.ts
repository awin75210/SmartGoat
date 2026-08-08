import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { IOT_SENSOR_METRICS, METRIC_FROM_DB } from "../constants/iot-device.constants";
import {
  mapBarnStatusRowToDomain,
  mapEnvironmentSummaryRowToDomain,
  mapIotChartRowToDomain,
} from "../mappers/iot.mapper";
import type { IotTimeRange } from "../types/iot.types";
import { buildMetricFromReading, emptySparklines } from "../utils/iot-metric.utils";
import { barnStatusStore, getHerdForFarm } from "../data/iot.store";
import type { IotRepository } from "./iot.repository";

function rangeStart(range: IotTimeRange): Date {
  const now = Date.now();
  const ms =
    range === "24h" ? 24 * 60 * 60 * 1000 : range === "7d" ? 7 * 86400000 : 30 * 86400000;
  return new Date(now - ms);
}

const EMPTY_ENVIRONMENT = {
  farm_id: "",
  health_percent: 0,
  health_label: "—",
  ventilation_status: "—",
  floor_status: "—",
  sensors_status: "Chưa có dữ liệu",
};

export class SupabaseIotRepository implements IotRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async getMetrics(farmId: string) {
    const supabase = await this.client();
    const metrics = [];

    for (const key of IOT_SENSOR_METRICS) {
      const dbKey = key === "toxicGas" ? "toxic_gas" : key === "feedLevel" ? "feed_level" : key;
      const { data } = await supabase
        .from("iot_sensor_readings")
        .select("*")
        .eq("farm_id", farmId)
        .eq("metric_key", dbKey)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        metrics.push(
          buildMetricFromReading({
            id: String(data.id),
            farmId,
            metricKey: key,
            value: Number(data.value),
            recordedAt: String(data.recorded_at),
          }),
        );
      }
    }

    return metrics;
  }

  async getSparklines(farmId: string) {
    const supabase = await this.client();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = emptySparklines();

    for (const key of IOT_SENSOR_METRICS) {
      const dbKey = key === "toxicGas" ? "toxic_gas" : key === "feedLevel" ? "feed_level" : key;
      const { data } = await supabase
        .from("iot_sensor_readings")
        .select("value, recorded_at")
        .eq("farm_id", farmId)
        .eq("metric_key", dbKey)
        .gte("recorded_at", since)
        .order("recorded_at", { ascending: true })
        .limit(48);

      result[key] = (data ?? []).map((row) => ({
        value: Number(row.value),
        recordedAt: String(row.recorded_at),
      }));
      result.ammonia = result.toxicGas;
    }

    return result;
  }

  async getChartSeries(farmId: string, range: IotTimeRange) {
    const supabase = await this.client();
    const from = rangeStart(range).toISOString();
    const { data } = await supabase
      .from("iot_sensor_readings")
      .select("metric_key, value, recorded_at")
      .eq("farm_id", farmId)
      .in("metric_key", ["temperature", "humidity", "toxic_gas", "light"])
      .gte("recorded_at", from)
      .order("recorded_at", { ascending: true });

    if (!data?.length) {
      return [];
    }

    const buckets = new Map<
      string,
      { temperatureC?: number; humidityPct?: number; toxicGasPpm?: number; lightLux?: number }
    >();

    for (const row of data) {
      const domainKey = METRIC_FROM_DB[String(row.metric_key)];
      if (!domainKey) continue;
      const day = String(row.recorded_at).slice(0, 10);
      const bucket = buckets.get(day) ?? {};
      if (domainKey === "temperature") bucket.temperatureC = Number(row.value);
      if (domainKey === "humidity") bucket.humidityPct = Number(row.value);
      if (domainKey === "toxicGas") bucket.toxicGasPpm = Number(row.value);
      if (domainKey === "light") bucket.lightLux = Number(row.value);
      buckets.set(day, bucket);
    }

    return Array.from(buckets.entries()).map(([day, values], index) =>
      mapIotChartRowToDomain({
        id: `chart-${farmId}-${index}`,
        farm_id: farmId,
        recorded_at: `${day}T08:00:00.000Z`,
        temperature_c: values.temperatureC ?? 0,
        humidity_pct: values.humidityPct ?? 0,
        toxic_gas_ppm: values.toxicGasPpm ?? 0,
        light_lux: values.lightLux ?? 0,
      }),
    );
  }

  async getBarnStatus(farmId: string) {
    return barnStatusStore.filter((r) => r.farm_id === farmId).map(mapBarnStatusRowToDomain);
  }

  async getHerdDisplaySummary(farmId: string) {
    return getHerdForFarm(farmId);
  }

  async getEnvironmentSummary(farmId: string) {
    const metrics = await this.getMetrics(farmId);
    if (!metrics.length) {
      return mapEnvironmentSummaryRowToDomain({ ...EMPTY_ENVIRONMENT, farm_id: farmId });
    }

    const temp = metrics.find((m) => m.metricKey === "temperature")?.value ?? 0;
    const humidity = metrics.find((m) => m.metricKey === "humidity")?.value ?? 0;
    const toxic = metrics.find((m) => m.metricKey === "toxicGas")?.value ?? 0;
    let health = 92;
    if (temp > 30 || temp < 16) health -= 15;
    if (humidity > 85 || humidity < 40) health -= 10;
    if (toxic >= 15) health -= 20;

    return mapEnvironmentSummaryRowToDomain({
      farm_id: farmId,
      health_percent: Math.max(0, Math.min(100, health)),
      health_label: health >= 80 ? "Tốt" : health >= 60 ? "Theo dõi" : "Cần xử lý",
      ventilation_status: metrics.find((m) => m.metricKey === "humidity")?.statusLabel ?? "—",
      floor_status: "Khô",
      sensors_status: `${metrics.length} cảm biến realtime`,
    });
  }
}
