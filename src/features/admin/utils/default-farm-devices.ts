import type { DeviceRow } from "../types/admin.types";

const DEFAULT_DEVICE_KIT: Omit<DeviceRow, "id" | "farm_id" | "last_seen_at">[] = [
  { name: "Cảm biến nhiệt độ A", device_type: "temperature", status: "online" },
  { name: "Cảm biến độ ẩm A", device_type: "humidity", status: "online" },
  { name: "Cảm biến NH₃ A", device_type: "ammonia", status: "online" },
  { name: "Cảm biến ánh sáng A", device_type: "light", status: "online" },
  { name: "Gateway IoT", device_type: "gateway", status: "online" },
  { name: "Quạt thông gió A", device_type: "actuator", status: "online" },
];

export function buildDefaultDevicesForFarm(farmId: string, nowIso: string): DeviceRow[] {
  const suffix = farmId.replace(/[^a-z0-9]/gi, "").slice(-6) || "new";
  return DEFAULT_DEVICE_KIT.map((device, index) => ({
    id: device.device_type === "gateway" ? `${farmId}-gateway` : `dev-${suffix}-${index}`,
    farm_id: farmId,
    last_seen_at: nowIso,
    ...device,
  }));
}
