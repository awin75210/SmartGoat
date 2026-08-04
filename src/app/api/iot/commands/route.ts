import { NextResponse } from "next/server";
import { getIotDeviceApiKey } from "@/lib/iot/env";
import { iotTelemetryService } from "@/features/iot-monitoring/services/iot-telemetry.service";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-iot-api-key");
  const expected = getIotDeviceApiKey();
  if (!expected || apiKey !== expected) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  try {
    const commands = await iotTelemetryService.pollCommands(deviceId);
    return NextResponse.json({ commands });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Poll failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-iot-api-key");
  const expected = getIotDeviceApiKey();
  if (!expected || apiKey !== expected) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as { commandId?: string; success?: boolean };
    if (!body.commandId) {
      return NextResponse.json({ error: "commandId required" }, { status: 400 });
    }
    await iotTelemetryService.ackCommand(body.commandId, body.success !== false);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ack failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
