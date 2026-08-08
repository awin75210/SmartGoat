/**
 * Mô phỏng ESP32 POST /api/iot/telemetry (nhiệt độ, độ ẩm, …).
 *
 * Usage:
 *   pnpm iot:sample
 *   pnpm iot:sample -- --temp 26.2 --humidity 68
 *   pnpm iot:sample -- --url http://192.168.1.10:3000 --history
 *
 * Cần .env.local: IOT_DEVICE_API_KEY (+ SUPABASE_SERVICE_ROLE_KEY nếu ghi DB)
 * Dev server phải đang chạy (pnpm dev).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const DEFAULTS = {
  url: "http://localhost:3000",
  farmId: "farm-capracare-001",
  deviceId: "dev-gateway",
  temperature: 25.6,
  humidity: 71,
  toxicGas: 9,
  feedLevel: 58,
  rain: 0,
  light: 135,
  history: false,
  historyHours: 24,
  intervalMinutes: 15,
};

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--url" && next) {
      opts.url = next;
      i++;
    } else if (arg === "--farm" && next) {
      opts.farmId = next;
      i++;
    } else if (arg === "--device" && next) {
      opts.deviceId = next;
      i++;
    } else if (arg === "--temp" && next) {
      opts.temperature = Number(next);
      i++;
    } else if (arg === "--humidity" && next) {
      opts.humidity = Number(next);
      i++;
    } else if (arg === "--history") {
      opts.history = true;
    } else if (arg === "--hours" && next) {
      opts.historyHours = Number(next);
      i++;
    }
  }
  return opts;
}

function buildPayload(opts, recordedAt) {
  return {
    deviceId: opts.deviceId,
    farmId: opts.farmId,
    recordedAt: recordedAt ?? new Date().toISOString(),
    readings: {
      temperature: opts.temperature,
      humidity: opts.humidity,
      toxicGas: opts.toxicGas,
      feedLevel: opts.feedLevel,
      rain: opts.rain,
      light: opts.light,
      servoRoof: 0,
      relays: { in1: false, in2: false, in3: false, in4: false },
    },
  };
}

async function postTelemetry(baseUrl, apiKey, payload) {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/iot/telemetry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-iot-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  const env = loadEnvLocal();
  const apiKey = env.IOT_DEVICE_API_KEY ?? process.env.IOT_DEVICE_API_KEY;
  if (!apiKey) {
    console.error("Thiếu IOT_DEVICE_API_KEY trong .env.local");
    process.exit(1);
  }

  const opts = parseArgs(process.argv.slice(2));
  const baseUrl = opts.url;

  if (opts.history) {
    const now = Date.now();
    const stepMs = opts.intervalMinutes * 60 * 1000;
    const points = Math.floor((opts.historyHours * 60) / opts.intervalMinutes);
    console.log(`Gửi ${points} mẫu lịch sử (${opts.historyHours}h, mỗi ${opts.intervalMinutes} phút)...`);

    for (let i = points; i >= 0; i--) {
      const t = new Date(now - i * stepMs);
      const wave = Math.sin(i / 4) * 0.8;
      const payload = buildPayload(
        {
          ...opts,
          temperature: Math.round((opts.temperature + wave) * 10) / 10,
          humidity: Math.round(opts.humidity + wave * 2),
        },
        t.toISOString(),
      );
      const result = await postTelemetry(baseUrl, apiKey, payload);
      process.stdout.write(`  ${t.toISOString()} → inserted ${result.inserted ?? "?"}\n`);
    }
  }

  const latest = buildPayload(opts);
  console.log("Gửi mẫu hiện tại (ESP):", {
    temperature: latest.readings.temperature,
    humidity: latest.readings.humidity,
    farmId: latest.farmId,
    deviceId: latest.deviceId,
  });

  const result = await postTelemetry(baseUrl, apiKey, latest);
  console.log("OK:", result);
  console.log("\nMở /app hoặc /app/iot để xem nhiệt độ & độ ẩm cập nhật.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
