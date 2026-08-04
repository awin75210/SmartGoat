"use client";

import Link from "next/link";
import { Grid, GridCol, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { MetricCardShell } from "@/shared/components/MetricCardShell/MetricCardShell";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { IotMainChart } from "@/features/iot-monitoring/components/IotMainChart";
import { IotLatestAlerts } from "@/features/iot-monitoring/components/IotLatestAlerts";
import { IotMetricCards } from "@/features/iot-monitoring/components/IotMetricCards";
import type { DashboardData } from "../services/dashboard.service";
import styles from "./DashboardPage.module.css";

type DashboardPageProps = {
  data: DashboardData;
  userName?: string;
};

export function DashboardPage({ data, userName }: DashboardPageProps) {
  return (
    <Stack gap="lg" className={styles.page}>
      <PageHeader
        title={userName ? `Xin chào, ${userName}` : "Tổng quan trại"}
        description="Ảnh tổng hợp môi trường, đàn dê và cảnh báo"
        actions={
          <Link href="/app/iot" className={styles.inlineLink}>
            Chi tiết IoT
          </Link>
        }
      />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <MetricCardShell
          label="Tổng đàn"
          value={String(data.herdStats.totalQuantity)}
          hint="Tổng số lượng đàn/lứa"
        />
        <MetricCardShell
          label="Cảnh báo mở"
          value={String(data.activeAlertCount)}
          hint="Cần theo dõi"
          statusLabel={data.activeAlertCount > 0 ? "Có việc cần xử lý" : "Ổn định"}
          statusColor={data.activeAlertCount > 0 ? "#e8590c" : "#40c057"}
        />
        <MetricCardShell
          label="Nhiệt độ hiện tại"
          value={String(
            data.iot.metrics.find((m) => m.metricKey === "temperature")?.value ?? "—",
          )}
          unit="°C"
        />
        <MetricCardShell
          label="Độ ẩm"
          value={String(data.iot.metrics.find((m) => m.metricKey === "humidity")?.value ?? "—")}
          unit="%"
        />
      </SimpleGrid>
      <IotMetricCards metrics={data.iot.metrics} sparklines={data.iot.sparklines} />
      <IotMainChart data={data.iot.chartSeries} />
      <Grid gap="md">
        <GridCol span={{ base: 12, md: 6 }}>
          <IotLatestAlerts alerts={data.latestAlerts} />
        </GridCol>
        <GridCol span={{ base: 12, md: 6 }}>
          <Paper withBorder radius="md" p="md" className={styles.card}>
            <Title order={4} className={styles.title} mb="md">
              Tổng quan đàn/lứa
            </Title>
            <Group grow>
              <StatBlock label="Đang nuôi" value={data.herdStats.activeQuantity} />
              <StatBlock label="Lứa active" value={data.herdStats.activeBatchCount} />
              <StatBlock label="Chuồng" value={data.herdStats.barnCount} />
            </Group>
          </Paper>
        </GridCol>
      </Grid>
    </Stack>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <Stack gap={2} align="center" className={styles.stat}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fw={700} size="xl" className={styles.statValue}>
        {value}
      </Text>
    </Stack>
  );
}
