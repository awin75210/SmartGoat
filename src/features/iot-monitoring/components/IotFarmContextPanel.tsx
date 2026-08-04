"use client";

import { Badge, Code, CopyButton, Group, Paper, Stack, Text, Title, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconRouter } from "@tabler/icons-react";
import type { IotFarmContext } from "../types/iot.types";
import styles from "./IotFarmContextPanel.module.css";

type IotFarmContextPanelProps = {
  context: IotFarmContext;
};

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.field}>
      <Text size="xs" c="dimmed" fw={600} tt="uppercase">
        {label}
      </Text>
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

export function IotFarmContextPanel({ context }: IotFarmContextPanelProps) {
  const firmwareSnippet = [
    `const char* FARM_ID = "${context.farmId}";`,
    `const char* DEVICE_ID = "${context.gatewayDeviceId}";`,
  ].join("\n");

  return (
    <Paper radius="lg" shadow="sm" p="lg" className={styles.card}>
      <Group justify="space-between" align="flex-start" mb="md" wrap="wrap">
        <div>
          <Group gap="xs" mb={4}>
            <IconRouter size={20} stroke={1.5} />
            <Title order={4}>Trang trại & kết nối ESP32</Title>
          </Group>
          <Text size="sm" c="dimmed">
            Dữ liệu và điều khiển IoT chỉ thuộc tài khoản / trang trại đang đăng nhập
          </Text>
        </div>
        <Badge color="capraBlue" variant="light" size="lg">
          {context.farmName}
        </Badge>
      </Group>

      <Stack gap="sm">
        <CopyField label="Mã trang trại (FARM_ID)" value={context.farmId} />
        <CopyField label="Mã gateway ESP32 (DEVICE_ID)" value={context.gatewayDeviceId} />
        {context.ownerEmail ? (
          <Text size="sm" c="dimmed">
            Chủ trại: <strong>{context.ownerEmail}</strong>
          </Text>
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
