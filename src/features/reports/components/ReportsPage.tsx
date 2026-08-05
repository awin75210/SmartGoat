"use client";

import { useState } from "react";
import { Button, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricCardShell } from "@/shared/components/MetricCardShell/MetricCardShell";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { exportReportAction } from "../actions/report.actions";
import type { FarmReport } from "../types/report.types";
import styles from "./ReportsPage.module.css";

type ReportsPageProps = {
  report: FarmReport;
};

export function ReportsPage({ report: initialReport }: ReportsPageProps) {
  const [report] = useState(initialReport);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const result = await exportReportAction(report.period);
    if (result.ok) {
      if (result.data.status === "csv" && result.data.csv) {
        const blob = new Blob(["\uFEFF" + result.data.csv], {
          type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
      setExportMessage(result.data.message);
    } else {
      setExportMessage(result.message);
    }
    setExporting(false);
  };

  return (
    <Stack gap="lg" className={styles.page}>
      <PageHeader
        title="Báo cáo trại"
        description="Tổng hợp KPI môi trường và cảnh báo (7 ngày cố định demo)"
        actions={
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            onClick={() => void handleExport()}
            loading={exporting}
          >
            Xuất báo cáo
          </Button>
        }
      />
      {exportMessage ? (
        <Text size="sm" c="dimmed">
          {exportMessage}
        </Text>
      ) : null}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {report.metrics.map((m) => (
          <MetricCardShell
            key={m.id}
            label={m.label}
            value={String(m.value)}
            unit={m.unit}
          />
        ))}
      </SimpleGrid>
      <Paper withBorder radius="md" p="md" className={styles.card}>
        <Title order={4} className={styles.title} mb="md">
          Nhiệt độ & độ ẩm trung bình
        </Title>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={report.chartSeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgTemperatureC" name="Nhiệt độ" stroke="#e8590c" />
            <Line type="monotone" dataKey="avgHumidityPct" name="Độ ẩm" stroke="#228be6" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      <Paper withBorder radius="md" p="md" className={styles.card}>
        <Title order={4} className={styles.title} mb="md">
          Số cảnh báo theo ngày
        </Title>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={report.chartSeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="alertCount" name="Cảnh báo" fill="#7950f2" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Stack>
  );
}
