"use client";

import { ResponsiveContainer, LineChart, Line } from "recharts";
import type { IotSparklinePoint } from "../types/iot.types";
import styles from "./IotSparklineChart.module.css";

type IotSparklineChartProps = {
  data: IotSparklinePoint[];
  color: string;
};

export function IotSparklineChart({ data, color }: IotSparklineChartProps) {
  const chartData = data.map((p, i) => ({ i, v: p.value }));
  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
