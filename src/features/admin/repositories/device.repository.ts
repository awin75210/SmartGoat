import type { Device } from "../types/admin.types";

export interface DeviceRepository {
  listDevices(farmId?: string): Promise<Device[]>;
}
