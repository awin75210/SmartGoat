import { createDeviceRepository } from "../repositories/create-device.repository";
import { createFarmRepository } from "../repositories/create-farm.repository";
import { createUserRepository } from "../repositories/create-user.repository";
import type { AdminUser, AdminDashboardStats, Device, Farm } from "../types/admin.types";

export class AdminService {
  private readonly farms = createFarmRepository();
  private readonly users = createUserRepository();
  private readonly devices = createDeviceRepository();

  async listFarms(): Promise<Farm[]> {
    return this.farms.listFarms();
  }

  async listDevices(farmId?: string): Promise<Device[]> {
    return this.devices.listDevices(farmId);
  }

  async getFarmById(farmId: string): Promise<Farm | null> {
    return this.farms.getFarmById(farmId);
  }

  async listUsers(): Promise<AdminUser[]> {
    return this.users.listUsers();
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [farms, users, devices] = await Promise.all([
      this.farms.listFarms(),
      this.users.listUsers(),
      this.devices.listDevices(),
    ]);
    return {
      farmCount: farms.length,
      userCount: users.length,
      activeDevices: devices.filter((d) => d.status === "online").length,
      offlineDevices: devices.filter((d) => d.status === "offline").length,
    };
  }
}

export const adminService = new AdminService();
