import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import capraUi from "@/shared/styles/capra-ui.module.css";
import styles from "./MetricCardShell.module.css";

type MetricCardShellProps = {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  icon?: React.ReactNode;
  sparkline?: React.ReactNode;
  statusLabel?: string;
  statusColor?: string;
  trendLabel?: string;
  valuePrefix?: string;
};

export function MetricCardShell({
  label,
  value,
  unit,
  hint,
  icon,
  sparkline,
  statusLabel,
  statusColor,
  trendLabel,
  valuePrefix,
}: MetricCardShellProps) {
  return (
    <Paper className={`${capraUi.capraCard} ${styles.card}`} p="md" radius="md">
      <Group justify="space-between" align="flex-start" mb="sm" wrap="nowrap">
        <Text size="sm" c="dimmed" fw={600} className={styles.label}>
          {label}
        </Text>
        {icon}
      </Group>
      <Group align="baseline" gap={6} wrap="nowrap">
        {valuePrefix ? (
          <Text size="sm" c="dimmed" fw={500}>
            {valuePrefix}
          </Text>
        ) : null}
        <Title order={3} className={styles.value}>
          {value}
        </Title>
        {unit ? (
          <Text size="sm" c="dimmed" className={styles.unit}>
            {unit}
          </Text>
        ) : null}
      </Group>
      {statusLabel ? (
        <Text size="xs" mt={6} fw={600} style={{ color: statusColor ?? "#228be6" }}>
          {statusLabel}
        </Text>
      ) : null}
      {hint ? (
        <Text size="xs" c="dimmed" mt={4}>
          Lý tưởng: {hint}
        </Text>
      ) : null}
      {trendLabel ? (
        <Text size="xs" mt={4} fw={500} className={styles.trend}>
          {trendLabel}
        </Text>
      ) : null}
      {sparkline ? <Stack mt="sm" className={styles.sparkline}>{sparkline}</Stack> : null}
    </Paper>
  );
}
