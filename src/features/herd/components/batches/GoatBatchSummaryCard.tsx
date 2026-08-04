"use client";

import { Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useWatch, type Control } from "react-hook-form";
import {
  GOAT_BATCH_GENDER_LABELS,
  GOAT_BATCH_SOURCE_LABELS,
} from "../../constants/goat-batch.constants";
import type { GoatBatchFormValues } from "../../schemas/goat-batch.schema";
import { formatAgeVi, formatBirthDateVi } from "../../utils/age.utils";
import type { Barn } from "../../types/barn.types";

type GoatBatchSummaryCardProps = {
  control: Control<GoatBatchFormValues>;
  barns: Barn[];
  today?: Date;
};

export function GoatBatchSummaryCard({ control, barns, today = new Date() }: GoatBatchSummaryCardProps) {
  const values = useWatch({ control });

  const barnName = barns.find((b) => b.id === values.barn_id)?.name ?? "—";
  const ageLabel = formatAgeVi(values.birth_date ?? null);
  const birthLabel = formatBirthDateVi(values.birth_date ?? null);
  const todayLabel = formatBirthDateVi(today);

  return (
    <Paper radius="lg" p="lg" variant="light" color="capraBlue">
      <Stack gap="sm">
        <Title order={5}>Thông tin xem trước</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
          <SummaryItem label="Ngày sinh" value={birthLabel} />
          <SummaryItem label="Ngày hiện tại" value={todayLabel} />
          <SummaryItem label="Tuổi hiện tại" value={ageLabel} />
          <SummaryItem label="Số lượng" value={values.quantity ? String(values.quantity) : "—"} />
          <SummaryItem label="Chuồng" value={barnName} />
          <SummaryItem label="Giống" value={values.breed?.trim() || "—"} />
          <SummaryItem
            label="Giới tính"
            value={values.gender ? GOAT_BATCH_GENDER_LABELS[values.gender] : "—"}
          />
          <SummaryItem
            label="Nguồn gốc"
            value={values.source ? GOAT_BATCH_SOURCE_LABELS[values.source] : "—"}
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={600} size="sm">
        {value}
      </Text>
    </div>
  );
}
