import { NextResponse } from "next/server";
import { getIotDeviceApiKey } from "@/lib/iot/env";
import { iotTelemetryService } from "@/features/iot-monitoring/services/iot-telemetry.service";
import type { IotTelemetryPayload } from "@/features/iot-monitoring/types/iot.types";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-iot-api-key");
  const expected = getIotDeviceApiKey();
  if (!expected || apiKey !== expected) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as IotTelemetryPayload;
    if (!body.deviceId || !body.farmId || !body.readings) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = await iotTelemetryService.ingest(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingest failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
