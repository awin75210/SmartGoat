import type {
  BarnStatusRow,
  IotChartPointRow,
  IotEnvironmentSummaryRow,
  IotMetricRow,
  IotSparklinePointRow,
} from "../types/iot.types";

export const iotMetricsStore: IotMetricRow[] = [];
export const iotSparklinesStore: IotSparklinePointRow[] = [];
export const iotChartStore: IotChartPointRow[] = [];
export const barnStatusStore: BarnStatusRow[] = [];
export const iotEnvironmentStore: IotEnvironmentSummaryRow[] = [];
export const iotHerdStore: Record<string, { total: number; monitoring: number; newKids: number }> =
  {};

/** IoT sensor data comes from Supabase / ESP — no in-memory seed. */
export function provisionFarmIot(_farmId: string, _farmName?: string, _nowIso?: string): void {
  // no-op
}

export function getEnvironmentForFarm(farmId: string): IotEnvironmentSummaryRow | undefined {
  return iotEnvironmentStore.find((e) => e.farm_id === farmId);
}

export function getHerdForFarm(farmId: string): { total: number; monitoring: number; newKids: number } {
  return iotHerdStore[farmId] ?? { total: 0, monitoring: 0, newKids: 0 };
}

export function removeFarmIot(farmId: string): void {
  for (let i = iotMetricsStore.length - 1; i >= 0; i -= 1) {
    if (iotMetricsStore[i]?.farm_id === farmId) iotMetricsStore.splice(i, 1);
  }
  for (let i = iotSparklinesStore.length - 1; i >= 0; i -= 1) {
    if (iotSparklinesStore[i]?.farm_id === farmId) iotSparklinesStore.splice(i, 1);
  }
  for (let i = iotChartStore.length - 1; i >= 0; i -= 1) {
    if (iotChartStore[i]?.farm_id === farmId) iotChartStore.splice(i, 1);
  }
  for (let i = barnStatusStore.length - 1; i >= 0; i -= 1) {
    if (barnStatusStore[i]?.farm_id === farmId) barnStatusStore.splice(i, 1);
  }
  for (let i = iotEnvironmentStore.length - 1; i >= 0; i -= 1) {
    if (iotEnvironmentStore[i]?.farm_id === farmId) iotEnvironmentStore.splice(i, 1);
  }
  delete iotHerdStore[farmId];
}
