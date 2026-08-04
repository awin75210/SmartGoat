import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin-client";
import {
  IOT_DEFAULT_GATEWAY_DEVICE_ID,
  IOT_RELAY_ACTUATORS,
  IOT_SERVO_ROOF_KEY,
  METRIC_DB_KEY,
  METRIC_FROM_DB,
} from "../constants/iot-device.constants";
import type { IotMetricKey, IotTelemetryPayload } from "../types/iot.types";

const RELAY_KEY_MAP = {
  in1: "relay_in1",
  in2: "relay_in2",
  in3: "relay_in3",
  in4: "relay_in4",
} as const;

export class IotTelemetryService {
  async ingest(payload: IotTelemetryPayload): Promise<{ inserted: number }> {
    const admin = tryCreateSupabaseAdminClient();
    if (!admin) {
      throw new Error("Supabase service role chưa cấu hình — không ghi telemetry được");
    }

    const recordedAt = payload.recordedAt ?? new Date().toISOString();
    const rows: Array<{
      farm_id: string;
      device_id: string;
      metric_key: string;
      value: number;
      unit: string;
      recorded_at: string;
    }> = [];

    for (const [key, value] of Object.entries(payload.readings)) {
      if (key === "relays" || key === "servoRoof" || typeof value !== "number") continue;
      const metricKey = key as IotMetricKey;
      if (!(metricKey in METRIC_DB_KEY) && metricKey !== "ammonia") continue;
      const dbKey = metricKey === "ammonia" ? "ammonia" : METRIC_DB_KEY[metricKey as keyof typeof METRIC_DB_KEY];
      rows.push({
        farm_id: payload.farmId,
        device_id: payload.deviceId,
        metric_key: dbKey,
        value,
        unit: "",
        recorded_at: recordedAt,
      });
      if (metricKey === "toxicGas") {
        rows.push({
          farm_id: payload.farmId,
          device_id: payload.deviceId,
          metric_key: "ammonia",
          value,
          unit: "ppm",
          recorded_at: recordedAt,
        });
      }
    }

    if (rows.length) {
      const { error } = await admin.from("iot_sensor_readings").insert(rows);
      if (error) throw new Error(error.message);
    }

    await admin
      .from("devices")
      .update({ status: "online", last_seen_at: recordedAt })
      .eq("id", payload.deviceId)
      .eq("farm_id", payload.farmId);

    if (payload.readings.relays) {
      for (const [channel, isOn] of Object.entries(payload.readings.relays)) {
        const actuatorKey = RELAY_KEY_MAP[channel as keyof typeof RELAY_KEY_MAP];
        if (!actuatorKey) continue;
        await admin
          .from("iot_actuator_states")
          .update({ is_on: Boolean(isOn), status: "online", updated_at: recordedAt })
          .eq("farm_id", payload.farmId)
          .eq("actuator_key", actuatorKey);
      }
    }

    if (typeof payload.readings.servoRoof === "number") {
      const position = Math.max(0, Math.min(100, payload.readings.servoRoof));
      await admin
        .from("iot_actuator_states")
        .update({
          position_pct: position,
          is_on: position > 0,
          status: "online",
          updated_at: recordedAt,
        })
        .eq("farm_id", payload.farmId)
        .eq("actuator_key", IOT_SERVO_ROOF_KEY);
    }

    return { inserted: rows.length };
  }

  async pollCommands(deviceId: string) {
    const admin = tryCreateSupabaseAdminClient();
    if (!admin) throw new Error("Supabase service role chưa cấu hình");

    const { data, error } = await admin
      .from("iot_device_commands")
      .select("*")
      .eq("device_id", deviceId)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(20);

    if (error) throw new Error(error.message);

    const ids = (data ?? []).map((row) => String(row.id));
    if (ids.length) {
      await admin
        .from("iot_device_commands")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .in("id", ids);
    }

    return (data ?? []).map((row) => ({
      id: String(row.id),
      actuatorKey: String(row.actuator_key),
      command: String(row.command),
      payload: (row.payload ?? {}) as Record<string, unknown>,
    }));
  }

  async ackCommand(commandId: string, success = true) {
    const admin = tryCreateSupabaseAdminClient();
    if (!admin) throw new Error("Supabase service role chưa cấu hình");

    const { error } = await admin
      .from("iot_device_commands")
      .update({
        status: success ? "acked" : "failed",
        acked_at: new Date().toISOString(),
      })
      .eq("id", commandId);

    if (error) throw new Error(error.message);
  }

  ensureDefaultActuators(farmId: string) {
    const admin = tryCreateSupabaseAdminClient();
    if (!admin) return Promise.resolve();

    const rows = [
      ...IOT_RELAY_ACTUATORS.map((relay) => ({
        farm_id: farmId,
        actuator_key: relay.key,
        name: relay.name,
        gpio: relay.gpio,
        device_type: "relay" as const,
      })),
      {
        farm_id: farmId,
        actuator_key: IOT_SERVO_ROOF_KEY,
        name: "Mái che thông minh",
        gpio: null,
        device_type: "servo" as const,
      },
    ];

    return admin.from("iot_actuator_states").upsert(rows, {
      onConflict: "farm_id,actuator_key",
      ignoreDuplicates: true,
    });
  }
}

export const iotTelemetryService = new IotTelemetryService();

export { METRIC_FROM_DB, IOT_DEFAULT_GATEWAY_DEVICE_ID };
