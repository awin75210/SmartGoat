/**
 * CapraCare ESP32 Gateway — SmartGoat IoT
 *
 * Thư viện cần cài (Arduino IDE → Library Manager):
 *   - ArduinoJson (bản 6.x hoặc 7.x)
 *   - ESP32Servo (hoặc Servo built-in trên ESP32 core)
 *   - DHT sensor library + Adafruit Unified Sensor (nếu dùng DHT22)
 *
 * Cấu hình .env server (.env.local):
 *   IOT_DEVICE_API_KEY=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *   DATA_SOURCE=supabase
 *
 * GPIO mapping (Relay 4CH):
 *   IN1 GPIO 25 → Đèn sưởi IR
 *   IN2 GPIO 26 → Quạt làm mát / hút
 *   IN3 GPIO 27 → Bơm phun sương
 *   IN4 GPIO 14 → Dự phòng
 *   Servo mái che → GPIO 13 (đổi SERVO_PIN nếu cần)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

// ─── WiFi ───────────────────────────────────────────────────────────────────
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// ─── CapraCare API ──────────────────────────────────────────────────────────
// Lấy FARM_ID và DEVICE_ID từ trang /app/iot (panel "Trang trại & kết nối ESP32")
// Dev local: http://192.168.x.x:3000  |  Production: https://your-domain.com
const char* API_BASE_URL = "http://192.168.1.100:3000";
const char* IOT_API_KEY = "your-iot-device-api-key";

const char* FARM_ID = "farm-capracare-001";      // ← đổi theo tài khoản đăng nhập
const char* DEVICE_ID = "dev-gateway";           // ← mã gateway của trang trại đó

// ─── GPIO ───────────────────────────────────────────────────────────────────
const int PIN_RELAY_IN1 = 25;
const int PIN_RELAY_IN2 = 26;
const int PIN_RELAY_IN3 = 27;
const int PIN_RELAY_IN4 = 14;
const int PIN_SERVO_ROOF = 13;

// Cảm biến (đổi pin theo mạch thực tế)
const int PIN_DHT = 4;           // DHT22
const int PIN_MQ135 = 34;        // Khí độc NH₃ (analog)
const int PIN_FEED_LEVEL = 35;   // Cảm biến mực thức ăn (analog)
const int PIN_RAIN = 32;         // Digital: LOW = có mưa
const int PIN_LIGHT = 33;        // LDR (analog)

// Relay module nhiều loại active LOW — đặt true nếu relay bật khi chân = LOW
const bool RELAY_ACTIVE_LOW = true;

// Chu kỳ gửi/nhận (ms)
const unsigned long TELEMETRY_INTERVAL_MS = 15000;
const unsigned long COMMAND_POLL_INTERVAL_MS = 3000;

// ─── State ──────────────────────────────────────────────────────────────────
Servo roofServo;
bool relayStates[4] = {false, false, false, false};
int servoPositionPct = 0;

unsigned long lastTelemetryMs = 0;
unsigned long lastCommandPollMs = 0;

// ─── Relay helpers ──────────────────────────────────────────────────────────
const int RELAY_PINS[4] = {PIN_RELAY_IN1, PIN_RELAY_IN2, PIN_RELAY_IN3, PIN_RELAY_IN4};

void setRelayPin(int index, bool on) {
  if (index < 0 || index > 3) return;
  relayStates[index] = on;
  int level = RELAY_ACTIVE_LOW ? (on ? LOW : HIGH) : (on ? HIGH : LOW);
  digitalWrite(RELAY_PINS[index], level);
}

bool readRelayPin(int index) {
  if (index < 0 || index > 3) return false;
  return relayStates[index];
}

int relayIndexFromGpio(int gpio) {
  for (int i = 0; i < 4; i++) {
    if (RELAY_PINS[i] == gpio) return i;
  }
  return -1;
}

int relayIndexFromActuatorKey(const char* key) {
  if (strcmp(key, "relay_in1") == 0) return 0;
  if (strcmp(key, "relay_in2") == 0) return 1;
  if (strcmp(key, "relay_in3") == 0) return 2;
  if (strcmp(key, "relay_in4") == 0) return 3;
  return -1;
}

// ─── Servo ──────────────────────────────────────────────────────────────────
void setServoRoofPct(int pct) {
  pct = constrain(pct, 0, 100);
  servoPositionPct = pct;
  // 0% = đóng (0°), 100% = mở (90°)
  int angle = map(pct, 0, 100, 0, 90);
  roofServo.write(angle);
}

// Giá trị test khi chưa gắn DHT22 (đồng bộ CapraCare seed / scripts/post-iot-sample.mjs)
const float TEST_TEMPERATURE_C = 25.6f;
const float TEST_HUMIDITY_PCT = 71.0f;
struct SensorReadings {
  float temperature;
  float humidity;
  float toxicGas;
  float feedLevel;
  int rain;
  float light;
};

SensorReadings readSensors() {
  SensorReadings r;

  // TODO: thay bằng DHT.readTemperature() / readHumidity() khi đã lắp DHT22
  r.temperature = TEST_TEMPERATURE_C + (random(0, 10) / 10.0f);
  r.humidity = TEST_HUMIDITY_PCT + (random(0, 4));

  // MQ135: map ADC → ppm (hiệu chuẩn theo môi trường thực)
  int mqRaw = analogRead(PIN_MQ135);
  r.toxicGas = map(mqRaw, 0, 4095, 0, 50);

  int feedRaw = analogRead(PIN_FEED_LEVEL);
  r.feedLevel = map(feedRaw, 0, 4095, 0, 100);

  r.rain = digitalRead(PIN_RAIN) == LOW ? 1 : 0;

  int lightRaw = analogRead(PIN_LIGHT);
  r.light = map(lightRaw, 0, 4095, 0, 500);

  return r;
}

// ─── HTTP ───────────────────────────────────────────────────────────────────
void addApiHeaders(HTTPClient& http) {
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-iot-api-key", IOT_API_KEY);
}

bool postTelemetry() {
  SensorReadings s = readSensors();

  StaticJsonDocument<768> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["farmId"] = FARM_ID;

  JsonObject readings = doc["readings"].to<JsonObject>();
  readings["temperature"] = round(s.temperature * 10) / 10.0;
  readings["humidity"] = round(s.humidity * 10) / 10.0;
  readings["toxicGas"] = round(s.toxicGas * 10) / 10.0;
  readings["feedLevel"] = (int)s.feedLevel;
  readings["rain"] = s.rain;
  readings["light"] = (int)s.light;
  readings["servoRoof"] = servoPositionPct;

  JsonObject relays = readings["relays"].to<JsonObject>();
  relays["in1"] = readRelayPin(0);
  relays["in2"] = readRelayPin(1);
  relays["in3"] = readRelayPin(2);
  relays["in4"] = readRelayPin(3);

  String body;
  serializeJson(doc, body);

  String url = String(API_BASE_URL) + "/api/iot/telemetry";
  HTTPClient http;

  if (String(API_BASE_URL).startsWith("https")) {
    WiFiClientSecure client;
    client.setInsecure();
    http.begin(client, url);
  } else {
    http.begin(url);
  }

  addApiHeaders(http);
  int code = http.POST(body);
  http.end();

  if (code == 200) {
    Serial.println("[telemetry] OK");
    return true;
  }

  if (code == 308 || code == 301 || code == 302) {
    Serial.printf("[telemetry] FAIL HTTP %d — đổi API_BASE_URL sang https:// (Vercel redirect HTTP→HTTPS)\n", code);
  } else {
    Serial.printf("[telemetry] FAIL HTTP %d\n", code);
  }
  return false;
}

bool executeCommand(const char* actuatorKey, const char* command, JsonVariant payload) {
  int relayIdx = relayIndexFromActuatorKey(actuatorKey);

  if (relayIdx >= 0) {
    bool turnOn = (strcmp(command, "on") == 0);
    setRelayPin(relayIdx, turnOn);
    Serial.printf("[cmd] Relay %s → %s\n", actuatorKey, turnOn ? "ON" : "OFF");
    return true;
  }

  if (strcmp(actuatorKey, "servo_roof") == 0) {
    if (strcmp(command, "open") == 0) {
      setServoRoofPct(100);
    } else if (strcmp(command, "close") == 0) {
      setServoRoofPct(0);
    } else if (strcmp(command, "set_position") == 0 && payload["positionPct"].is<int>()) {
      setServoRoofPct(payload["positionPct"].as<int>());
    }
    Serial.printf("[cmd] Servo mái che → %d%%\n", servoPositionPct);
    return true;
  }

  // Fallback: dùng GPIO trong payload
  if (payload["gpio"].is<int>()) {
    int gpio = payload["gpio"].as<int>();
    relayIdx = relayIndexFromGpio(gpio);
    if (relayIdx >= 0) {
      bool turnOn = (strcmp(command, "on") == 0);
      setRelayPin(relayIdx, turnOn);
      return true;
    }
  }

  Serial.printf("[cmd] Không nhận diện: %s / %s\n", actuatorKey, command);
  return false;
}

bool ackCommand(const char* commandId, bool success) {
  StaticJsonDocument<128> doc;
  doc["commandId"] = commandId;
  doc["success"] = success;

  String body;
  serializeJson(doc, body);

  String url = String(API_BASE_URL) + "/api/iot/commands";
  HTTPClient http;

  if (String(API_BASE_URL).startsWith("https")) {
    WiFiClientSecure client;
    client.setInsecure();
    http.begin(client, url);
  } else {
    http.begin(url);
  }

  addApiHeaders(http);
  int code = http.POST(body);
  http.end();

  return code == 200;
}

void pollCommands() {
  String url = String(API_BASE_URL) + "/api/iot/commands?deviceId=" + DEVICE_ID;
  HTTPClient http;

  if (String(API_BASE_URL).startsWith("https")) {
    WiFiClientSecure client;
    client.setInsecure();
    http.begin(client, url);
  } else {
    http.begin(url);
  }

  addApiHeaders(http);
  int code = http.GET();
  if (code != 200) {
    Serial.printf("[commands] poll FAIL HTTP %d\n", code);
    http.end();
    return;
  }

  String response = http.getString();
  http.end();

  StaticJsonDocument<2048> doc;
  DeserializationError err = deserializeJson(doc, response);
  if (err) {
    Serial.println("[commands] JSON parse error");
    return;
  }

  JsonArray commands = doc["commands"].as<JsonArray>();
  if (commands.isNull() || commands.size() == 0) return;

  for (JsonObject cmd : commands) {
    const char* id = cmd["id"];
    const char* actuatorKey = cmd["actuatorKey"];
    const char* command = cmd["command"];
    bool ok = executeCommand(actuatorKey, command, cmd["payload"]);
    ackCommand(id, ok);
  }
}

// ─── WiFi ───────────────────────────────────────────────────────────────────
void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("WiFi connecting to %s", WIFI_SSID);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi OK — IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi FAILED — kiểm tra SSID/password");
  }
}

// ─── Setup / Loop ───────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== CapraCare ESP32 Gateway ===");

  pinMode(PIN_RELAY_IN1, OUTPUT);
  pinMode(PIN_RELAY_IN2, OUTPUT);
  pinMode(PIN_RELAY_IN3, OUTPUT);
  pinMode(PIN_RELAY_IN4, OUTPUT);
  pinMode(PIN_RAIN, INPUT_PULLUP);

  for (int i = 0; i < 4; i++) setRelayPin(i, false);

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  roofServo.setPeriodHertz(50);
  roofServo.attach(PIN_SERVO_ROOF, 500, 2400);
  setServoRoofPct(0);

  analogReadResolution(12);
  randomSeed(esp_random());

  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    delay(2000);
    return;
  }

  unsigned long now = millis();

  if (now - lastCommandPollMs >= COMMAND_POLL_INTERVAL_MS) {
    lastCommandPollMs = now;
    pollCommands();
  }

  if (now - lastTelemetryMs >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMs = now;
    postTelemetry();
  }

  delay(50);
}
