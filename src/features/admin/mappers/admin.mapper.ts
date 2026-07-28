import type { AdminUser, AdminUserRow, Device, DeviceRow, Farm, FarmRow } from "../types/admin.types";

export function mapFarmRowToDomain(row: FarmRow): Farm {
  return {
    id: row.id,
    name: row.name,
    ownerEmail: row.owner_email,
    location: row.location,
    goatCount: row.goat_count,
    deviceCount: row.device_count,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export function mapAdminUserRowToDomain(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    farmId: row.farm_id,
    isActive: row.is_active,
  };
}

export function mapDeviceRowToDomain(row: DeviceRow): Device {
  return {
    id: row.id,
    farmId: row.farm_id,
    name: row.name,
    deviceType: row.device_type,
    status: row.status,
    lastSeenAt: row.last_seen_at,
  };
}
