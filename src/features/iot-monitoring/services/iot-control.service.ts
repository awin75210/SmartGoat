import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  IOT_RELAY_ACTUATORS,
  IOT_SERVO_ROOF_KEY,
} from "../constants/iot-device.constants";
import type { IotActuatorState } from "../types/iot.types";
import { iotGatewayService } from "./iot-gateway.service";
import { iotTelemetryService } from "./iot-telemetry.service";

export class IotControlService {
  async listActuators(farmId: string): Promise<IotActuatorState[]> {
    try {
      const supabase = await createSupabaseServerClient();
      let { data, error } = await supabase
        .from("iot_actuator_states")
        .select("*")
        .eq("farm_id", farmId)
        .order("actuator_key");

      if (!error && !data?.length) {
        await iotTelemetryService.ensureDefaultActuators(farmId);
        ({ data, error } = await supabase
          .from("iot_actuator_states")
          .select("*")
          .eq("farm_id", farmId)
          .order("actuator_key"));
      }

      if (!error && data?.length) {
        return data.map(mapActuatorRow);
      }
    } catch {
      // fall through to defaults
    }

    return this.defaultActuators();
  }

  defaultActuators(): IotActuatorState[] {
    const now = new Date().toISOString();
    return [
      ...IOT_RELAY_ACTUATORS.map((relay) => ({
        actuatorKey: relay.key,
        name: relay.name,
        gpio: relay.gpio,
        deviceType: "relay" as const,
        isOn: false,
        positionPct: null,
        status: "offline" as const,
        updatedAt: now,
      })),
      {
        actuatorKey: IOT_SERVO_ROOF_KEY,
        name: "Mái che thông minh",
        gpio: null,
        deviceType: "servo" as const,
        isOn: false,
        positionPct: 0,
        status: "offline" as const,
        updatedAt: now,
      },
    ];
  }

  async setRelay(farmId: string, actuatorKey: string, isOn: boolean) {
    const { deviceId } = await iotGatewayService.resolveGatewayForFarm(farmId);
    const command = isOn ? "on" : "off";

    const supabase = await createSupabaseServerClient();
    const { error: stateError } = await supabase
      .from("iot_actuator_states")
      .update({ is_on: isOn, updated_at: new Date().toISOString() })
      .eq("farm_id", farmId)
      .eq("actuator_key", actuatorKey);

    if (stateError) throw new Error(stateError.message);

    const { data, error } = await supabase
      .from("iot_device_commands")
      .insert({
        farm_id: farmId,
        device_id: deviceId,
        actuator_key: actuatorKey,
        command,
        payload: { gpio: IOT_RELAY_ACTUATORS.find((r) => r.key === actuatorKey)?.gpio ?? null },
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { commandId: String(data.id) };
  }

  async setServoRoof(farmId: string, open: boolean) {
    const { deviceId } = await iotGatewayService.resolveGatewayForFarm(farmId);
    const command = open ? "open" : "close";
    const positionPct = open ? 100 : 0;

    const supabase = await createSupabaseServerClient();
    await supabase
      .from("iot_actuator_states")
      .update({
        is_on: open,
        position_pct: positionPct,
        updated_at: new Date().toISOString(),
      })
      .eq("farm_id", farmId)
      .eq("actuator_key", IOT_SERVO_ROOF_KEY);

    const { data, error } = await supabase
      .from("iot_device_commands")
      .insert({
        farm_id: farmId,
        device_id: deviceId,
        actuator_key: IOT_SERVO_ROOF_KEY,
        command,
        payload: { positionPct },
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { commandId: String(data.id) };
  }

  async getGatewayStatus(farmId: string) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase
        .from("devices")
        .select("id, name, status, last_seen_at")
        .eq("farm_id", farmId)
        .eq("device_type", "gateway")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        const lastSeen = data.last_seen_at ? new Date(String(data.last_seen_at)).getTime() : 0;
        const online = data.status === "online" && Date.now() - lastSeen < 5 * 60 * 1000;
        return {
          deviceId: String(data.id),
          deviceName: String(data.name),
          online,
          lastSeenAt: data.last_seen_at ? String(data.last_seen_at) : null,
        };
      }
    } catch {
      // seed fallback below
    }

    const fallback = await iotGatewayService.resolveGatewayForFarm(farmId);
    return {
      deviceId: fallback.deviceId,
      deviceName: fallback.deviceName,
      online: false,
      lastSeenAt: null,
    };
  }
}

function mapActuatorRow(row: Record<string, unknown>): IotActuatorState {
  return {
    actuatorKey: String(row.actuator_key),
    name: String(row.name),
    gpio: row.gpio === null || row.gpio === undefined ? null : Number(row.gpio),
    deviceType: row.device_type === "servo" ? "servo" : "relay",
    isOn: Boolean(row.is_on),
    positionPct:
      row.position_pct === null || row.position_pct === undefined
        ? null
        : Number(row.position_pct),
    status:
      row.status === "online" || row.status === "maintenance" ? row.status : "offline",
    updatedAt: String(row.updated_at),
  };
}

export const iotControlService = new IotControlService();
