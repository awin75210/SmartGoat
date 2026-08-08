import type { IotMonitoringSnapshot, IotTimeRange } from "../types/iot.types";
import { emptySparklines } from "../utils/iot-metric.utils";
import type { IotRepository } from "./iot.repository";

const EMPTY_ENVIRONMENT: IotMonitoringSnapshot["environmentSummary"] = {
  healthPercent: 0,
  healthLabel: "—",
  ventilationStatus: "—",
  floorStatus: "—",
  sensorsStatus: "Chưa có dữ liệu",
};

/** Không dùng seed — chỉ trả rỗng khi chưa cấu hình Supabase. */
export class EmptyIotRepository implements IotRepository {
  async getMetrics() {
    return [];
  }

  async getSparklines() {
    return emptySparklines();
  }

  async getChartSeries() {
    return [];
  }

  async getBarnStatus() {
    return [];
  }

  async getHerdDisplaySummary() {
    return { total: 0, monitoring: 0, newKids: 0 };
  }

  async getEnvironmentSummary() {
    return EMPTY_ENVIRONMENT;
  }
}
