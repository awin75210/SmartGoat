import { FARMS_SEED, ADMIN_USERS_SEED, DEVICES_SEED } from "./admin.seed";
import type { AdminUserRow, DeviceRow, FarmRow } from "../types/admin.types";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export const farmsStore: FarmRow[] = clone(FARMS_SEED);
export const adminUsersStore: AdminUserRow[] = clone(ADMIN_USERS_SEED);
export const devicesStore: DeviceRow[] = clone(DEVICES_SEED);

export function countDevicesForFarm(farmId: string): number {
  return devicesStore.filter((d) => d.farm_id === farmId).length;
}

export function syncFarmDeviceCount(farmId: string): void {
  const farm = farmsStore.find((f) => f.id === farmId);
  if (farm) {
    farm.device_count = countDevicesForFarm(farmId);
  }
}

export function removeFarmFromStore(farmId: string): void {
  const farmIndex = farmsStore.findIndex((f) => f.id === farmId);
  if (farmIndex >= 0) {
    farmsStore.splice(farmIndex, 1);
  }

  for (let i = devicesStore.length - 1; i >= 0; i -= 1) {
    if (devicesStore[i]?.farm_id === farmId) {
      devicesStore.splice(i, 1);
    }
  }

  for (let i = adminUsersStore.length - 1; i >= 0; i -= 1) {
    if (adminUsersStore[i]?.farm_id === farmId) {
      adminUsersStore.splice(i, 1);
    }
  }
}
