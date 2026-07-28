import { SeedDeviceRepository } from "./seed-device.repository";
import type { DeviceRepository } from "./device.repository";

export function createDeviceRepository(): DeviceRepository {
  return new SeedDeviceRepository();
}
