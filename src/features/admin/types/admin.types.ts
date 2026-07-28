import type { UserRole } from "@/shared/types/roles";

export type FarmRow = {
  id: string;
  name: string;
  owner_email: string;
  location: string;
  goat_count: number;
  device_count: number;
  status: "active" | "suspended";
  updated_at: string;
};

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  farm_id: string | null;
  is_active: boolean;
};

export type DeviceRow = {
  id: string;
  farm_id: string;
  name: string;
  device_type: string;
  status: "online" | "offline" | "maintenance";
  last_seen_at: string;
};

export type Farm = {
  id: string;
  name: string;
  ownerEmail: string;
  location: string;
  goatCount: number;
  deviceCount: number;
  status: "active" | "suspended";
  updatedAt: string;
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  farmId: string | null;
  isActive: boolean;
};

export type Device = {
  id: string;
  farmId: string;
  name: string;
  deviceType: string;
  status: "online" | "offline" | "maintenance";
  lastSeenAt: string;
};

export type AdminDashboardStats = {
  farmCount: number;
  activeDevices: number;
  offlineDevices: number;
  userCount: number;
};
