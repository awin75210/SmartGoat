"use client";

import { Paper, Text, Title } from "@mantine/core";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import capraUi from "@/shared/styles/capra-ui.module.css";
import type { IotChartPoint } from "../types/iot.types";
import styles from "./IotMainChart.module.css";

type IotMainChartProps = {
  data: IotChartPoint[];
};

export function IotMainChart({ data }: IotMainChartProps) {
  return (
    <Paper radius="md" p="md" className={`${capraUi.capraCard} ${styles.card}`}>
      <Title order={4} className={capraUi.capraCardTitle} mb="xs">
        Biểu đồ nhiệt độ & độ ẩm (7 ngày qua)
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        15/07 – 21/07 · Nhiệt độ (°C) và độ ẩm (%)
      </Text>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#5c7a99" }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="temp"
              tick={{ fontSize: 12, fill: "#5c7a99" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <YAxis
              yAxisId="hum"
              orientation="right"
              tick={{ fontSize: 12, fill: "#5c7a99" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperatureC"
              name="Nhiệt độ (°C)"
              stroke="#40c057"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#40c057" }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="hum"
              type="monotone"
              dataKey="humidityPct"
              name="Độ ẩm (%)"
              stroke="#228be6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#228be6" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
}
