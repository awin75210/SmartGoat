"use client";

import { Group, Paper, RingProgress, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconGridDots, IconWind } from "@tabler/icons-react";
import capraUi from "@/shared/styles/capra-ui.module.css";
import type { IotEnvironmentSummary } from "../types/iot.types";
import styles from "./IotBarnStatus.module.css";

type IotBarnStatusProps = {
  summary: IotEnvironmentSummary;
};

export function IotBarnStatus({ summary }: IotBarnStatusProps) {
  return (
    <Paper radius="md" p="lg" className={`${capraUi.capraCard} ${styles.card}`}>
      <Title order={4} className={capraUi.capraCardTitle} mb="lg">
        Tình trạng chuồng
      </Title>
      <Stack align="center" gap="xs" mb="lg">
        <RingProgress
          size={148}
          thickness={14}
          roundCaps
          sections={[{ value: summary.healthPercent, color: "capraGreen" }]}
          label={
            <Stack gap={0} align="center">
              <Text fw={800} size="xl" className={styles.ringValue}>
                {summary.healthPercent}%
              </Text>
              <Text size="sm" fw={600} c="capraGreen">
                {summary.healthLabel}
              </Text>
            </Stack>
          }
        />
        <Text size="sm" c="dimmed" ta="center" fw={500}>
          Chỉ số sức khỏe chuồng
        </Text>
      </Stack>
      <Stack gap="md">
        <StatusRow
          icon={<IconWind size={18} />}
          label="Hệ thống thông gió"
          value={summary.ventilationStatus}
        />
        <StatusRow
          icon={<IconGridDots size={18} />}
          label="Tình trạng nền chuồng"
          value={summary.floorStatus}
        />
      </Stack>
    </Paper>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Group justify="space-between" className={styles.statusRow} wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon variant="light" color="capraBlue" radius="md" size="lg">
          {icon}
        </ThemeIcon>
        <Text size="sm" fw={500}>
          {label}
        </Text>
      </Group>
      <Text size="sm" fw={700} c="capraGreen">
        {value}
      </Text>
    </Group>
  );
}
