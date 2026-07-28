"use client";

import { SimpleGrid, ThemeIcon } from "@mantine/core";
import {
  IconDroplet,
  IconLeaf,
  IconSun,
  IconTemperature,
  IconWind,
} from "@tabler/icons-react";
import { MetricCardShell } from "@/shared/components/MetricCardShell/MetricCardShell";
import type { IotMetric, IotMetricKey, IotSparklinePoint } from "../types/iot.types";
import { IotSparklineChart } from "./IotSparklineChart";

const METRIC_META: Record<
  IotMetricKey,
  { label: string; icon: typeof IconTemperature; color: string; themeColor: string }
> = {
  temperature: { label: "Nhiệt độ", icon: IconTemperature, color: "#40c057", themeColor: "green" },
  humidity: { label: "Độ ẩm", icon: IconDroplet, color: "#228be6", themeColor: "blue" },
  airQuality: { label: "Chất lượng không khí", icon: IconWind, color: "#40c057", themeColor: "green" },
  light: { label: "Ánh sáng", icon: IconSun, color: "#fab005", themeColor: "yellow" },
  ammonia: { label: "Ammonia NH₃", icon: IconLeaf, color: "#7950f2", themeColor: "grape" },
};

function formatMetricValue(metric: IotMetric): string {
  if (metric.metricKey === "temperature") {
    return metric.value.toFixed(1);
  }
  if (metric.metricKey === "airQuality") {
    return "Tốt";
  }
  return String(metric.value);
}

function formatMetricUnit(metric: IotMetric): string | undefined {
  if (metric.metricKey === "airQuality") {
    return `AQI ${metric.value}`;
  }
  return metric.unit;
}

function formatTrendLabel(trend?: string): string | undefined {
  if (!trend) {
    return undefined;
  }
  if (trend.startsWith("↑") || trend.startsWith("↓") || trend.startsWith("–")) {
    return trend;
  }
  if (trend.startsWith("+")) {
    return `↑ ${trend.slice(1).trim()}`;
  }
  if (trend.startsWith("−") || trend.startsWith("-")) {
    return `↓ ${trend.slice(1).trim()}`;
  }
  if (trend === "Ổn định") {
    return "– Ổn định";
  }
  return trend;
}

type IotMetricCardsProps = {
  metrics: IotMetric[];
  sparklines: Record<IotMetricKey, IotSparklinePoint[]>;
};

export function IotMetricCards({ metrics, sparklines }: IotMetricCardsProps) {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 5 }} spacing="md">
      {metrics.map((metric) => {
        const meta = METRIC_META[metric.metricKey];
        const Icon = meta.icon;
        const isAir = metric.metricKey === "airQuality";
        return (
          <MetricCardShell
            key={metric.id}
            label={meta.label}
            value={formatMetricValue(metric)}
            unit={formatMetricUnit(metric)}
            valuePrefix={isAir ? "–" : undefined}
            hint={metric.idealRange}
            trendLabel={formatTrendLabel(metric.trendLabel)}
            statusLabel={isAir ? undefined : metric.statusLabel === "Ổn định" ? undefined : metric.statusLabel}
            statusColor={meta.color}
            icon={
              <ThemeIcon variant="light" color={meta.themeColor} radius="md" size="lg">
                <Icon size={18} stroke={1.6} />
              </ThemeIcon>
            }
            sparkline={
              <IotSparklineChart data={sparklines[metric.metricKey] ?? []} color={meta.color} />
            }
          />
        );
      })}
    </SimpleGrid>
  );
}
