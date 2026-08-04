import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { iotControlService } from "./iot-control.service";
import { createIotRepository } from "../repositories/create-iot.repository";
import type { IotMonitoringSnapshot, IotTimeRange } from "../types/iot.types";

export class IotMonitoringService {
  private readonly repo = createIotRepository();

  async getMonitoringSnapshot(
    farmId: string = DEFAULT_FARM_ID,
    range: IotTimeRange = "7d",
  ): Promise<IotMonitoringSnapshot> {
    const [metrics, sparklines, chartSeries, barnStatus, environmentSummary, gateway, actuators] =
      await Promise.all([
        this.repo.getMetrics(farmId),
        this.repo.getSparklines(farmId),
        this.repo.getChartSeries(farmId, range),
        this.repo.getBarnStatus(farmId),
        this.repo.getEnvironmentSummary(farmId),
        iotControlService.getGatewayStatus(farmId),
        iotControlService.listActuators(farmId),
      ]);
    return {
      metrics,
      sparklines,
      chartSeries,
      barnStatus,
      environmentSummary,
      gateway,
      actuators,
      range,
    };
  }

  async getHerdDisplaySummary(farmId: string = DEFAULT_FARM_ID) {
    return this.repo.getHerdDisplaySummary(farmId);
  }
}

export const iotMonitoringService = new IotMonitoringService();
