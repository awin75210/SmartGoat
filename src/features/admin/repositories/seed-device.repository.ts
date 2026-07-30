import { devicesStore, syncFarmDeviceCount } from "../data/admin.store";
import { mapDeviceRowToDomain } from "../mappers/admin.mapper";
import type { DeviceRow } from "../types/admin.types";
import type { DeviceRepository } from "./device.repository";

export class SeedDeviceRepository implements DeviceRepository {
  async listDevices(farmId?: string) {
    const rows = farmId ? devicesStore.filter((d) => d.farm_id === farmId) : devicesStore;
    return rows.map(mapDeviceRowToDomain);
  }

  async createDevices(devices: DeviceRow[]) {
    devicesStore.push(...devices);
    if (devices[0]?.farm_id) {
      syncFarmDeviceCount(devices[0].farm_id);
    }
    return devices.map(mapDeviceRowToDomain);
  }

  async deleteByFarmId(farmId: string) {
    for (let i = devicesStore.length - 1; i >= 0; i -= 1) {
      if (devicesStore[i]?.farm_id === farmId) {
        devicesStore.splice(i, 1);
      }
    }
  }
}
