import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { getDefaultIotGatewayId } from "@/lib/iot/env";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type ResolvedGateway = {
  deviceId: string;
  deviceName: string;
};

export class IotGatewayService {
  /** Gateway thuộc trang trại — tra từ bảng devices, fallback demo farms. */
  async resolveGatewayForFarm(farmId: string): Promise<ResolvedGateway> {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase
        .from("devices")
        .select("id, name")
        .eq("farm_id", farmId)
        .eq("device_type", "gateway")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        return {
          deviceId: String(data.id),
          deviceName: String(data.name),
        };
      }
    } catch {
      // seed / offline fallback
    }

    const deviceId = getDefaultIotGatewayId(farmId);
    return { deviceId, deviceName: "Gateway IoT ESP32" };
  }

  /** Trang trại sở hữu thiết bị — dùng cho API ESP32 (service role). */
  async resolveFarmForDevice(deviceId: string): Promise<string | null> {
    const admin = tryCreateSupabaseAdminClient();
    if (!admin) return null;

    const { data, error } = await admin
      .from("devices")
      .select("farm_id")
      .eq("id", deviceId)
      .maybeSingle();

    if (error || !data?.farm_id) return null;
    return String(data.farm_id);
  }

  async assertDeviceBelongsToFarm(deviceId: string, farmId: string): Promise<void> {
    const ownerFarmId = await this.resolveFarmForDevice(deviceId);
    if (!ownerFarmId) {
      throw new Error("Thiết bị IoT không tồn tại trong hệ thống");
    }
    if (ownerFarmId !== farmId) {
      throw new Error("Thiết bị không thuộc trang trại này");
    }
  }
}

export const iotGatewayService = new IotGatewayService();
