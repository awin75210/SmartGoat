import type { Device } from "../types/admin.types";
import type { DeviceRow } from "../types/admin.types";

export interface DeviceRepository {
  listDevices(farmId?: string): Promise<Device[]>;
  createDevices(devices: DeviceRow[]): Promise<Device[]>;
  deleteByFarmId(farmId: string): Promise<void>;
}
