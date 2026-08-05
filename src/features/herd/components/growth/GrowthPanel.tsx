"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createGrowthRecordAction } from "../../actions/herd-extended.actions";
import { formatDateVi } from "../../utils/stage.utils";
import type { GrowthProjection } from "../../utils/growth-projection.utils";
import type { GrowthRecord } from "../../types/growth.types";

type GrowthPanelProps = {
  batchId: string;
  records: GrowthRecord[];
  projection: GrowthProjection | null;
  readOnly?: boolean;
};

export function GrowthPanel({ batchId, records, projection, readOnly = false }: GrowthPanelProps) {
  const router = useRouter();
  const [recordedAt, setRecordedAt] = useState<Date | null>(new Date());
  const [avgWeight, setAvgWeight] = useState<number | string>(20);
  const [sampleSize, setSampleSize] = useState<number | string>(5);
  const [feedKg, setFeedKg] = useState<number | string>("");
  const [pending, setPending] = useState(false);

  const chartData = [...records]
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map((r) => ({
      label: formatDateVi(r.recordedAt),
      weight: r.avgWeightKg,
    }));

  const handleSave = () => {
    if (!recordedAt || !avgWeight) return;
    void (async () => {
      setPending(true);
      try {
        await createGrowthRecordAction({
          batch_id: batchId,
          recorded_at: recordedAt,
          avg_weight_kg: Number(avgWeight),
          sample_size: Number(sampleSize) || 1,
          feed_kg_per_day: feedKg === "" ? null : Number(feedKg),
        });
        router.refresh();
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <Stack gap="md">
      {projection ? (
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Text size="xs" c="dimmed">
              ADG
            </Text>
            <Text fw={700}>
              {projection.adgKgPerDay !== null
                ? `${projection.adgKgPerDay.toFixed(3)} kg/ngày`
                : "—"}
            </Text>
          </Paper>
          <Paper withBorder p="md" radius="md">
            <Text size="xs" c="dimmed">
              Cân nặng gần nhất
            </Text>
            <Text fw={700}>
              {projection.currentWeightKg !== null
                ? `${projection.currentWeightKg} kg`
                : "—"}
            </Text>
          </Paper>
          <Paper withBorder p="md" radius="md">
            <Text size="xs" c="dimmed">
              Dự kiến xuất chuồng ({projection.targetWeightKg} kg)
            </Text>
            <Text fw={700}>
              {projection.estimatedMarketDate
                ? formatDateVi(projection.estimatedMarketDate)
                : "Chưa đủ dữ liệu"}
            </Text>
            {projection.daysRemaining !== null ? (
              <Text size="xs" c="dimmed">
                Còn ~{projection.daysRemaining} ngày
              </Text>
            ) : null}
          </Paper>
        </SimpleGrid>
      ) : null}

      {projection?.feedRatioWarning ? (
        <Text size="sm" c="orange">
          {projection.feedRatioWarning}
        </Text>
      ) : null}

      {chartData.length > 0 ? (
        <Paper withBorder radius="md" p="md">
          <Title order={5} mb="md">
            Biểu đồ cân nặng
          </Title>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis unit=" kg" />
              <Tooltip />
              <Line type="monotone" dataKey="weight" name="TB (kg)" stroke="#40c057" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      ) : null}

      {!readOnly ? (
        <Paper withBorder radius="md" p="md">
          <Title order={5} mb="md">
            Ghi cân định kỳ
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <DateInput
              label="Ngày cân"
              value={recordedAt}
              onChange={(next) => {
                if (!next) {
                  setRecordedAt(null);
                  return;
                }
                const parsed = new Date(next);
                setRecordedAt(Number.isNaN(parsed.getTime()) ? null : parsed);
              }}
              maxDate={new Date()}
            />
            <NumberInput
              label="Trọng lượng TB (kg)"
              min={0}
              decimalScale={2}
              value={avgWeight}
              onChange={setAvgWeight}
            />
            <NumberInput
              label="Số con cân mẫu"
              min={1}
              value={sampleSize}
              onChange={setSampleSize}
            />
            <NumberInput
              label="Khẩu phần (kg/ngày)"
              min={0}
              decimalScale={2}
              value={feedKg}
              onChange={setFeedKg}
            />
          </SimpleGrid>
          <Group justify="flex-end" mt="md">
            <Button loading={pending} onClick={handleSave}>
              Lưu bản ghi cân
            </Button>
          </Group>
        </Paper>
      ) : null}
    </Stack>
  );
}
