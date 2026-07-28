import type { IotMonitoringSnapshot, IotTimeRange } from "../types/iot.types";

export interface IotRepository {
  getMetrics(farmId: string): Promise<IotMonitoringSnapshot["metrics"]>;
  getSparklines(farmId: string): Promise<IotMonitoringSnapshot["sparklines"]>;
  getChartSeries(farmId: string, range: IotTimeRange): Promise<IotMonitoringSnapshot["chartSeries"]>;
  getBarnStatus(farmId: string): Promise<IotMonitoringSnapshot["barnStatus"]>;
  getHerdDisplaySummary(farmId: string): Promise<{
    total: number;
    monitoring: number;
    newKids: number;
  }>;
  getEnvironmentSummary(farmId: string): Promise<IotMonitoringSnapshot["environmentSummary"]>;
}
