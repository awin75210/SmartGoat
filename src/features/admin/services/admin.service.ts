import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AppError } from "@/lib/errors/app-error";
import { registerAuthUser, removeAuthUsersByFarmId } from "@/features/auth/repositories/seed-auth.repository";
import { provisionFarmIot, removeFarmIot } from "@/features/iot-monitoring/data/iot.store";
import { iotTelemetryService } from "@/features/iot-monitoring/services/iot-telemetry.service";
import { buildDefaultDevicesForFarm } from "../utils/default-farm-devices";
import { assignOwnerFarmIdByEmail } from "../repositories/assign-owner-farm";
import { generateFarmId, generateUserId } from "../utils/generate-ids";
import { createDeviceRepository } from "../repositories/create-device.repository";
import { createFarmRepository } from "../repositories/create-farm.repository";
import { createUserRepository } from "../repositories/create-user.repository";
import { insertFarmSettings } from "../repositories/supabase-farm.repository";
import { insertDefaultBarns } from "@/features/herd/repositories/supabase-barn-provision";
import type {
  AdminUser,
  CreateFarmInput,
  CreateFarmResult,
  AdminDashboardStats,
  Device,
  Farm,
} from "../types/admin.types";

function usesSupabaseData(): boolean {
  return process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured();
}

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

  async createFarmWithOwner(input: CreateFarmInput): Promise<CreateFarmResult> {
    const existing = await this.users.findByEmail(input.ownerEmail);
    if (existing) {
      throw new AppError("VALIDATION_ERROR", "Email chủ trại đã được sử dụng");
    }

    const farmId = generateFarmId(input.name);
    const userId = generateUserId();
    const nowIso = new Date().toISOString();

    const farm = await this.farms.createFarm({
      id: farmId,
      name: input.name,
      location: input.location,
      ownerEmail: input.ownerEmail,
      goatCount: input.goatCount,
      nowIso,
    });

    const deviceRows = buildDefaultDevicesForFarm(farmId, nowIso);
    await this.devices.createDevices(deviceRows);
    provisionFarmIot(farmId, input.name, nowIso);

    if (usesSupabaseData()) {
      await insertFarmSettings(farmId, input.name, input.ownerEmail);
      await insertDefaultBarns(farmId);
      await iotTelemetryService.ensureDefaultActuators(farmId);
    }

    if (usesSupabaseData()) {
      const profileLinked = await assignOwnerFarmIdByEmail(input.ownerEmail, farmId);
      const gatewayId = `${farmId}-gateway`;
      return {
        farm: (await this.farms.getFarmById(farmId)) ?? farm,
        owner: null,
        note: profileLinked
          ? `Đã tạo trại và gán farm_id cho tài khoản ${input.ownerEmail}. Gateway ESP32: ${gatewayId}`
          : `Đã tạo trại. Tạo tài khoản Supabase Auth với email ${input.ownerEmail}, rồi gán profiles.farm_id = ${farmId}. Gateway ESP32: ${gatewayId}`,
      };
    }

    const owner = await this.users.createFarmOwner({
      id: userId,
      email: input.ownerEmail,
      fullName: input.ownerFullName,
      farmId,
      password: input.ownerPassword,
    });

    registerAuthUser({
      id: userId,
      email: input.ownerEmail,
      password: input.ownerPassword,
      fullName: input.ownerFullName,
      farmId,
    });

    return {
      farm: (await this.farms.getFarmById(farmId)) ?? farm,
      owner,
    };
  }

  async deleteFarm(farmId: string): Promise<void> {
    const farm = await this.farms.getFarmById(farmId);
    if (!farm) {
      throw new AppError("NOT_FOUND", "Không tìm thấy trang trại");
    }

    removeFarmIot(farmId);
    if (!usesSupabaseData()) {
      removeAuthUsersByFarmId(farmId);
    }
    await this.farms.deleteFarm(farmId);
  }
}

export const adminService = new AdminService();
