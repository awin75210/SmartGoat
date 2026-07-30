import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { SEED_REFERENCE_ISO } from "@/shared/utils/format";
import type { AdminUserRow, DeviceRow, FarmRow } from "../types/admin.types";
import { buildDefaultDevicesForFarm } from "../utils/default-farm-devices";

export const FARMS_SEED: FarmRow[] = [
  {
    id: DEFAULT_FARM_ID,
    name: "Trang trại CapraCare",
    owner_email: "owner@capracare.vn",
    location: "Lâm Đồng",
    goat_count: 13,
    device_count: 6,
    status: "active",
    updated_at: SEED_REFERENCE_ISO,
  },
  {
    id: "farm-capracare-002",
    name: "Trại Bình An",
    owner_email: "binhan@capracare.demo",
    location: "Ninh Thuận",
    goat_count: 40,
    device_count: 6,
    status: "active",
    updated_at: "2025-07-20T08:00:00.000Z",
  },
];

export const ADMIN_USERS_SEED: AdminUserRow[] = [
  {
    id: "user-admin-001",
    email: "admin@capracare.vn",
    full_name: "Quản trị CapraCare",
    role: "admin",
    farm_id: null,
    is_active: true,
  },
  {
    id: "user-owner-001",
    email: "owner@capracare.vn",
    full_name: "Nguyễn Văn Trang",
    role: "farm_owner",
    farm_id: DEFAULT_FARM_ID,
    is_active: true,
  },
  {
    id: "user-owner-002",
    email: "binhan@capracare.demo",
    full_name: "Trần Bình An",
    role: "farm_owner",
    farm_id: "farm-capracare-002",
    is_active: true,
  },
];

const FARM_002_DEVICES = buildDefaultDevicesForFarm("farm-capracare-002", SEED_REFERENCE_ISO).map(
  (device, index) => ({
    ...device,
    id: ["dev2-temp-a", "dev2-hum-a", "dev2-nh3-a", "dev2-light-a", "dev2-gateway", "dev2-fan-a"][index]!,
    name:
      index === 4
        ? "Gateway IoT Bình An"
        : device.name,
  }),
);

export const DEVICES_SEED: DeviceRow[] = [
  {
    id: "dev-temp-a",
    farm_id: DEFAULT_FARM_ID,
    name: "Cảm biến nhiệt độ A",
    device_type: "temperature",
    status: "online",
    last_seen_at: SEED_REFERENCE_ISO,
  },
  {
    id: "dev-hum-b",
    farm_id: DEFAULT_FARM_ID,
    name: "Cảm biến độ ẩm B",
    device_type: "humidity",
    status: "online",
    last_seen_at: SEED_REFERENCE_ISO,
  },
  {
    id: "dev-nh3-b",
    farm_id: DEFAULT_FARM_ID,
    name: "Cảm biến NH₃ B",
    device_type: "ammonia",
    status: "online",
    last_seen_at: "2025-07-21T07:55:00.000Z",
  },
  {
    id: "dev-light-b",
    farm_id: DEFAULT_FARM_ID,
    name: "Cảm biến ánh sáng B",
    device_type: "light",
    status: "offline",
    last_seen_at: "2025-07-18T11:00:00.000Z",
  },
  {
    id: "dev-gateway",
    farm_id: DEFAULT_FARM_ID,
    name: "Gateway IoT",
    device_type: "gateway",
    status: "online",
    last_seen_at: SEED_REFERENCE_ISO,
  },
  {
    id: "dev-fan-b",
    farm_id: DEFAULT_FARM_ID,
    name: "Quạt thông gió B",
    device_type: "actuator",
    status: "maintenance",
    last_seen_at: "2025-07-19T08:00:00.000Z",
  },
  ...FARM_002_DEVICES,
];
