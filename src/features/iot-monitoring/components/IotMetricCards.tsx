"use client";

import { SimpleGrid, ThemeIcon } from "@mantine/core";
import {
  IconCloudRain,
  IconDroplet,
  IconLeaf,
  IconSun,
  IconTemperature,
  IconWheat,
} from "@tabler/icons-react";
import { MetricCardShell } from "@/shared/components/MetricCardShell/MetricCardShell";
import { IOT_METRIC_LABELS } from "../constants/iot-device.constants";
import type { IotMetric, IotMetricKey, IotSparklinePoint } from "../types/iot.types";
import {
  formatIotMetricUnit,
  formatIotMetricValue,
  formatIotRecordedAtHint,
} from "../utils/iot-display.utils";
import { IotSparklineChart } from "./IotSparklineChart";

const METRIC_META: Record<
  IotMetricKey,
  { label: string; icon: typeof IconTemperature; color: string; themeColor: string }
> = {
  temperature: { label: IOT_METRIC_LABELS.temperature, icon: IconTemperature, color: "#40c057", themeColor: "green" },
  humidity: { label: IOT_METRIC_LABELS.humidity, icon: IconDroplet, color: "#228be6", themeColor: "blue" },
  toxicGas: { label: IOT_METRIC_LABELS.toxicGas, icon: IconLeaf, color: "#7950f2", themeColor: "grape" },
  feedLevel: { label: IOT_METRIC_LABELS.feedLevel, icon: IconWheat, color: "#fab005", themeColor: "yellow" },
  rain: { label: IOT_METRIC_LABELS.rain, icon: IconCloudRain, color: "#15aabf", themeColor: "cyan" },
  light: { label: IOT_METRIC_LABELS.light, icon: IconSun, color: "#fab005", themeColor: "yellow" },
  ammonia: { label: "Ammonia NH₃", icon: IconLeaf, color: "#7950f2", themeColor: "grape" },
};

const DISPLAY_ORDER: IotMetricKey[] = [
  "temperature",
  "humidity",
  "toxicGas",
  "feedLevel",
  "rain",
  "light",
];

type IotMetricCardsProps = {
  metrics: IotMetric[];
  sparklines: Record<IotMetricKey, IotSparklinePoint[]>;
};

export function IotMetricCards({ metrics, sparklines }: IotMetricCardsProps) {
  const metricMap = new Map(metrics.map((m) => [m.metricKey, m]));

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 3 }} spacing="md">
      {DISPLAY_ORDER.map((key) => {
        const metric = metricMap.get(key);
        const meta = METRIC_META[key];
        const Icon = meta.icon;
        const showRecordedAt = key === "temperature" || key === "humidity";

        return (
          <MetricCardShell
            key={key}
            label={meta.label}
            value={formatIotMetricValue(metric)}
            unit={formatIotMetricUnit(metric, key)}
            hint={metric?.idealRange}
            trendLabel={showRecordedAt ? formatIotRecordedAtHint(metric) : metric?.trendLabel}
            statusLabel={
              metric && metric.statusLabel !== "Ổn định" && metric.statusLabel !== "Phù hợp"
                ? metric.statusLabel
                : undefined
            }
            statusColor={meta.color}
            icon={
              <ThemeIcon variant="light" color={meta.themeColor} radius="md" size="lg">
                <Icon size={18} stroke={1.6} />
              </ThemeIcon>
            }
            sparkline={
              metric ? (
                <IotSparklineChart
                  data={sparklines[metric.metricKey] ?? []}
                  color={meta.color}
                />
              ) : undefined
            }
          />
        );
      })}
    </SimpleGrid>
  );
}
