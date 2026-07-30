import { buildInitialIotStores, buildFarmIotBundle } from "../utils/provision-farm-iot";
import type {
  BarnStatusRow,
  IotChartPointRow,
  IotEnvironmentSummaryRow,
  IotMetricRow,
  IotSparklinePointRow,
} from "../types/iot.types";

const initial = buildInitialIotStores();

export const iotMetricsStore: IotMetricRow[] = initial.metrics;
export const iotSparklinesStore: IotSparklinePointRow[] = initial.sparklines;
export const iotChartStore: IotChartPointRow[] = initial.chart;
export const barnStatusStore: BarnStatusRow[] = initial.barns;
export const iotEnvironmentStore: IotEnvironmentSummaryRow[] = initial.environments;
export const iotHerdStore: Record<string, { total: number; monitoring: number; newKids: number }> =
  initial.herds;

export function provisionFarmIot(farmId: string, farmName?: string, nowIso?: string): void {
  if (iotMetricsStore.some((m) => m.farm_id === farmId)) {
    return;
  }

  const bundle = buildFarmIotBundle(farmId, farmName, nowIso);
  iotMetricsStore.push(...bundle.metrics);
  iotSparklinesStore.push(...bundle.sparklines);
  iotChartStore.push(...bundle.chart);
  barnStatusStore.push(...bundle.barns);
  iotEnvironmentStore.push(bundle.environment);
  iotHerdStore[farmId] = bundle.herd;
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
