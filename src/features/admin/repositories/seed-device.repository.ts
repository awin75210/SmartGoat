import { DEVICES_SEED } from "../data/admin.seed";
import { mapDeviceRowToDomain } from "../mappers/admin.mapper";
import type { DeviceRepository } from "./device.repository";

export class SeedDeviceRepository implements DeviceRepository {
  async listDevices(farmId?: string) {
    const rows = farmId
      ? DEVICES_SEED.filter((d) => d.farm_id === farmId)
      : DEVICES_SEED;
    return rows.map(mapDeviceRowToDomain);
  }
}
