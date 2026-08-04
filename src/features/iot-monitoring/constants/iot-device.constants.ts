export const IOT_SENSOR_METRICS = [
  "temperature",
  "humidity",
  "toxicGas",
  "feedLevel",
  "rain",
  "light",
] as const;

export type IotSensorMetricKey = (typeof IOT_SENSOR_METRICS)[number];

/** Includes legacy ammonia for alert compatibility */
export type IotMetricKey = IotSensorMetricKey | "ammonia";

export const IOT_METRIC_LABELS: Record<IotSensorMetricKey, string> = {
  temperature: "Nhiệt độ",
  humidity: "Độ ẩm",
  toxicGas: "Khí độc (NH₃)",
  feedLevel: "Cần thức ăn",
  rain: "Cảm biến mưa",
  light: "Ánh sáng",
};

export const IOT_METRIC_UNITS: Record<IotSensorMetricKey, string> = {
  temperature: "°C",
  humidity: "%",
  toxicGas: "ppm",
  feedLevel: "%",
  rain: "",
  light: "lux",
};

export const IOT_RELAY_ACTUATORS = [
  {
    key: "relay_in1",
    gpio: 25,
    channel: "IN1",
    name: "Đèn sưởi IR",
  },
  {
    key: "relay_in2",
    gpio: 26,
    channel: "IN2",
    name: "Quạt làm mát / hút",
  },
  {
    key: "relay_in3",
    gpio: 27,
    channel: "IN3",
    name: "Bơm mini phun sương",
  },
  {
    key: "relay_in4",
    gpio: 14,
    channel: "IN4",
    name: "Dự phòng (quạt phụ / đèn UV)",
  },
] as const;

export type IotRelayActuatorKey = (typeof IOT_RELAY_ACTUATORS)[number]["key"];

export const IOT_SERVO_ROOF_KEY = "servo_roof" as const;

export type IotActuatorKey = IotRelayActuatorKey | typeof IOT_SERVO_ROOF_KEY;

export const IOT_DEFAULT_GATEWAY_DEVICE_ID = "dev-gateway";

export const METRIC_DB_KEY: Record<IotSensorMetricKey, string> = {
  temperature: "temperature",
  humidity: "humidity",
  toxicGas: "toxic_gas",
  feedLevel: "feed_level",
  rain: "rain",
  light: "light",
};

export const METRIC_FROM_DB: Record<string, IotSensorMetricKey> = {
  temperature: "temperature",
  humidity: "humidity",
  toxic_gas: "toxicGas",
  feed_level: "feedLevel",
  rain: "rain",
  light: "light",
  ammonia: "toxicGas",
};
