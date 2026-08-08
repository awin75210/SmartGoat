"use client";

import { Alert, Badge, Code, CopyButton, Group, Paper, Stack, Text, Title, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconRouter } from "@tabler/icons-react";
import type { IotFarmContext } from "../types/iot.types";
import {
  buildEsp32FirmwareSnippet,
  buildEsp32TelemetryExample,
  ESP32_TELEMETRY_PATH,
} from "../utils/esp32-config.utils";
import styles from "./IotFarmContextPanel.module.css";

type IotFarmContextPanelProps = {
  context: IotFarmContext;
  /** Hiển thị hướng dẫn API đầy đủ (dùng ở trang Cài đặt). */
  detailed?: boolean;
  iotApiConfigured?: boolean;
  appBaseUrl?: string;
  title?: string;
  description?: string;
};

function CopyField({ label, value, description }: { label: string; value: string; description?: string }) {
  return (
    <div className={styles.field}>
      <Text size="xs" c="dimmed" fw={600} tt="uppercase">
        {label}
      </Text>
      {description ? (
        <Text size="xs" c="dimmed" mb={4}>
          {description}
        </Text>
      ) : null}
      <Group gap="xs" wrap="nowrap">
        <Code className={styles.code}>{value}</Code>
        <CopyButton value={value}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? "Đã copy" : "Copy"} withArrow>
              <button type="button" className={styles.copyBtn} onClick={copy} aria-label={`Copy ${label}`}>
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </button>
            </Tooltip>
          )}
        </CopyButton>
      </Group>
    </div>
  );
}

export function IotFarmContextPanel({
  context,
  detailed = false,
  iotApiConfigured = false,
  appBaseUrl,
  title = "Trang trại & kết nối ESP32",
  description = "Dữ liệu và điều khiển IoT chỉ thuộc tài khoản / trang trại đang đăng nhập",
}: IotFarmContextPanelProps) {
  const firmwareSnippet = buildEsp32FirmwareSnippet(context, { detailed, appBaseUrl });
  const telemetryExample = buildEsp32TelemetryExample(context);

  return (
    <Paper radius="lg" shadow="sm" p="lg" className={styles.card}>
      <Group justify="space-between" align="flex-start" mb="md" wrap="wrap">
        <div>
          <Group gap="xs" mb={4}>
            <IconRouter size={20} stroke={1.5} />
            <Title order={4}>{title}</Title>
          </Group>
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        </div>
        <Badge color="capraBlue" variant="light" size="lg">
          {context.farmName}
        </Badge>
      </Group>

      <Stack gap="sm">
        <CopyField label="Mã trang trại (FARM_ID)" value={context.farmId} />
        <CopyField
          label="Mã gateway ESP32 (DEVICE_ID)"
          value={context.gatewayDeviceId}
          description="Phải khớp thiết bị gateway đã đăng ký trên Supabase"
        />

        {context.ownerEmail ? (
          <Text size="sm" c="dimmed">
            Tài khoản: <strong>{context.ownerEmail}</strong>
          </Text>
        ) : null}

        {detailed ? (
          <>
            <CopyField
              label="Endpoint telemetry"
              value={ESP32_TELEMETRY_PATH}
              description="Gửi POST tới {API_BASE_URL}{endpoint} — không gọi Supabase REST trực tiếp"
            />
            <CopyField
              label="Header xác thực"
              value="x-iot-api-key: <IOT_DEVICE_API_KEY>"
              description="Không dùng Supabase anon key trên ESP32"
            />
            <Alert color="blue" variant="light" title="Vercel / HTTPS">
              Dùng <strong>https://</strong> trong <strong>API_BASE_URL</strong>. Nếu dùng{" "}
              <strong>http://</strong> trên <strong>*.vercel.app</strong>, server trả{" "}
              <strong>HTTP 308</strong> và ESP32 không gửi được dữ liệu.
            </Alert>
            <Alert
              color={iotApiConfigured ? "green" : "orange"}
              variant="light"
              title={iotApiConfigured ? "Server đã cấu hình IOT_DEVICE_API_KEY" : "Chưa cấu hình IOT_DEVICE_API_KEY"}
            >
              {iotApiConfigured
                ? "Đặt cùng giá trị IOT_API_KEY trong sketch ESP32 như trong .env.local của server."
                : "Thêm IOT_DEVICE_API_KEY vào .env.local trên máy chạy website, rồi khớp với firmware."}
            </Alert>
            <div className={styles.field}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={6}>
                Mẫu JSON gửi lên API
              </Text>
              <Code block className={styles.firmwareBlock}>
                {telemetryExample}
              </Code>
              <CopyButton value={telemetryExample}>
                {({ copied, copy }) => (
                  <button type="button" className={styles.copyLink} onClick={copy}>
                    {copied ? "Đã copy JSON mẫu" : "Copy JSON mẫu"}
                  </button>
                )}
              </CopyButton>
            </div>
          </>
        ) : null}

        <div className={styles.field}>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={6}>
            Cấu hình firmware (Arduino)
          </Text>
          <Code block className={styles.firmwareBlock}>
            {firmwareSnippet}
          </Code>
          <CopyButton value={firmwareSnippet}>
            {({ copied, copy }) => (
              <button type="button" className={styles.copyLink} onClick={copy}>
                {copied ? "Đã copy đoạn cấu hình" : "Copy đoạn cấu hình vào sketch ESP32"}
              </button>
            )}
          </CopyButton>
        </div>
      </Stack>
    </Paper>
  );
}
