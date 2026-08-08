import type { IotFarmContext } from "../types/iot.types";

const TELEMETRY_PATH = "/api/iot/telemetry";

/** ESP32 POST must hit the final URL — Vercel returns 308 if you use http:// on *.vercel.app */
export function normalizeEsp32ApiBaseUrl(url?: string): string {
  const fallback = "http://<IP-may-chay-website>:3000";
  if (!url?.trim()) {
    return fallback;
  }

  let normalized = url.trim().replace(/\/$/, "");
  try {
    const parsed = new URL(normalized);
    if (parsed.hostname.endsWith(".vercel.app") && parsed.protocol === "http:") {
      parsed.protocol = "https:";
      normalized = parsed.origin;
    }
  } catch {
    return fallback;
  }

  return normalized;
}

export function buildEsp32FirmwareSnippet(
  context: IotFarmContext,
  options?: { detailed?: boolean; appBaseUrl?: string },
): string {
  const apiBaseUrl = normalizeEsp32ApiBaseUrl(options?.appBaseUrl);
  const lines = [
    `const char* API_BASE_URL = "${apiBaseUrl}";`,
    `const char* IOT_API_KEY = "<trùng IOT_DEVICE_API_KEY trên server>";`,
    `const char* FARM_ID = "${context.farmId}";`,
    `const char* DEVICE_ID = "${context.gatewayDeviceId}";`,
  ];

  if (options?.detailed) {
    lines.push(
      "",
      `// POST \${API_BASE_URL}${TELEMETRY_PATH}`,
      "// Header: x-iot-api-key: {IOT_API_KEY}",
      '// Body: {"deviceId","farmId","readings":{"temperature":25.6,"humidity":71}}',
    );
  }

  return lines.join("\n");
}

export function buildEsp32TelemetryExample(context: IotFarmContext): string {
  return JSON.stringify(
    {
      deviceId: context.gatewayDeviceId,
      farmId: context.farmId,
      readings: {
        temperature: 25.6,
        humidity: 71,
      },
    },
    null,
    2,
  );
}

export const ESP32_TELEMETRY_PATH = TELEMETRY_PATH;
