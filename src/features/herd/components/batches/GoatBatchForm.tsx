"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { Controller } from "react-hook-form";
import { notifications } from "@mantine/notifications";
import { runWithNotification } from "@/shared/utils/async-notification";
import { createGoatBatchAction } from "../../actions/herd-extended.actions";
import {
  GOAT_BATCH_GENDER_LABELS,
  GOAT_BATCH_GENDERS,
  GOAT_BATCH_SOURCE_LABELS,
  GOAT_BATCH_SOURCES,
  GOAT_BATCH_STATUS_LABELS,
  GOAT_BATCH_STATUSES,
} from "../../constants/goat-batch.constants";
import {
  defaultGoatBatchFormValues,
  useGoatBatchForm,
} from "../../hooks/useGoatBatchForm";
import { useGoatBatchAge } from "../../hooks/useGoatBatchAge";
import { goatBatchFormToPayload } from "../../schemas/goat-batch.schema";
import type { Barn } from "../../types/barn.types";
import type { GoatBatch } from "../../types/goat-batch.types";
import {
  formatBarnCapacityHint,
  getBarnOccupiedQuantity,
  validateBatchQuantity,
} from "../../utils/barn-capacity.utils";
import {
  DEVELOPMENT_STAGE_LABELS,
  DEVELOPMENT_STAGES,
} from "../../constants/development-stage.constants";
import dayjs from "dayjs";
import { inferDevelopmentStage } from "../../utils/stage.utils";
import { startOfToday } from "../../utils/age.utils";
import { GoatBatchFormHeader } from "./GoatBatchFormHeader";
import { GoatBatchSummaryCard } from "./GoatBatchSummaryCard";
import { BirthDateRow } from "./fields/BirthDateRow";
import { BreedSelect } from "./fields/BreedSelect";
import styles from "./GoatBatchForm.module.css";

type GoatBatchFormProps = {
  barns: Barn[];
  batches: GoatBatch[];
  readOnly?: boolean;
};

export function GoatBatchForm({ barns, batches, readOnly = false }: GoatBatchFormProps) {
  const router = useRouter();
  const form = useGoatBatchForm(barns, batches);
  const { control, handleSubmit, reset, watch, trigger, formState } = form;
  const birthDate = watch("birth_date");
  const barnId = watch("barn_id");
  const quantity = watch("quantity");
  const status = watch("status");
  const source = watch("source");
  const stageOverride = watch("stage_override");
  const inferredStage = birthDate
    ? inferDevelopmentStage(dayjs(birthDate).format("YYYY-MM-DD"))
    : "newborn";
  const ageLabel = useGoatBatchAge(birthDate);
  const submitting = formState.isSubmitting;
  const fieldsDisabled = readOnly || submitting;

  const selectedBarn = useMemo(
    () => barns.find((barn) => barn.id === barnId),
    [barns, barnId],
  );
  const occupied = useMemo(
    () => (barnId ? getBarnOccupiedQuantity(batches, barnId) : 0),
    [batches, barnId],
  );
  const capacityHint = formatBarnCapacityHint(selectedBarn, occupied);
  const capacityError = validateBatchQuantity({
    quantity: quantity ?? 1,
    barn: selectedBarn,
    occupied,
    status,
  });

  const barnOptions = barns.map((b) => ({ value: b.id, label: b.name }));
  const genderData = GOAT_BATCH_GENDERS.map((g) => ({
    value: g,
    label: GOAT_BATCH_GENDER_LABELS[g],
  }));
  const sourceOptions = GOAT_BATCH_SOURCES.map((s) => ({
    value: s,
    label: GOAT_BATCH_SOURCE_LABELS[s],
  }));
  const stageOptions = DEVELOPMENT_STAGES.map((s) => ({
    value: s,
    label: DEVELOPMENT_STAGE_LABELS[s],
  }));
  const today = startOfToday();

  const statusOptions = GOAT_BATCH_STATUSES.map((s) => ({
    value: s,
    label: GOAT_BATCH_STATUS_LABELS[s],
  }));

  const onSubmit = handleSubmit((values) => {
    void (async () => {
      const result = await runWithNotification(
        "goat-batch-create",
        {
          loading: "Đang lưu đàn/lứa…",
          success: `Đã lưu đàn ${values.name}`,
          error: "Không lưu được đàn/lứa",
        },
        async () => {
          const payload = goatBatchFormToPayload(values);
          return createGoatBatchAction({
            ...payload,
            birth_date: values.birth_date!,
          });
        },
      );

      if (!result.ok) return;

      notifications.update({
        id: "goat-batch-create",
        message: `Mã đàn tự động: ${result.data.batchCode}`,
      });

      reset(defaultGoatBatchFormValues);
      router.push("/app/herd");
      router.refresh();
    })();
  });

  return (
    <Stack gap="lg" className={styles.page}>
      <GoatBatchFormHeader />

      <Paper radius="lg" shadow="sm" className={styles.formCard} pos="relative">
        <LoadingOverlay
          visible={submitting}
          zIndex={1000}
          overlayProps={{ radius: "lg" }}
          loaderProps={{ type: "bars" }}
        />
        <form onSubmit={readOnly ? (e) => e.preventDefault() : onSubmit}>
          <Stack gap="xl" className={styles.formBody}>
            <section className={styles.section}>
              <Title order={5} className={styles.sectionTitle}>
                Thông tin đàn
              </Title>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" className={styles.fieldGrid}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label="Tên đàn"
                      placeholder="VD: Lứa tháng 3"
                      required
                      disabled={fieldsDisabled}
                      error={formState.errors.name?.message}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="barn_id"
                  control={control}
                  render={({ field }) => (
                    <Stack gap={4}>
                      <Select
                        label="Chuồng"
                        placeholder={barns.length ? "Chọn chuồng" : "Chưa có chuồng"}
                        data={barnOptions}
                        required
                        disabled={fieldsDisabled || barns.length === 0}
                        error={formState.errors.barn_id?.message}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          void trigger(["quantity", "barn_id"]);
                        }}
                        onBlur={field.onBlur}
                      />
                      {barns.length === 0 ? (
                        <Text size="xs" c="dimmed">
                          Tạo chuồng tại trang Đàn dê trước khi thêm lứa.
                        </Text>
                      ) : field.value && capacityHint ? (
                        <Text size="xs" c={capacityError ? "red" : "dimmed"}>
                          {capacityHint}
                        </Text>
                      ) : null}
                    </Stack>
                  )}
                />
                <Controller
                  name="breed"
                  control={control}
                  render={({ field }) => (
                    <BreedSelect
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={formState.errors.breed?.message}
                      disabled={fieldsDisabled}
                    />
                  )}
                />
              </SimpleGrid>
            </section>

            <section className={styles.section}>
              <Title order={5} className={styles.sectionTitle}>
                Ngày sinh & số lượng
              </Title>
              <Text size="sm" c="dimmed" className={styles.sectionHint}>
                Chọn ngày sinh lứa hoặc bấm 「Ngày hiện tại」 để gán nhanh.
              </Text>
              <Controller
                name="birth_date"
                control={control}
                render={({ field }) => (
                  <BirthDateRow
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    onAppliedToday={() => {
                      void trigger("birth_date");
                    }}
                    error={formState.errors.birth_date?.message}
                    disabled={fieldsDisabled}
                    ageLabel={ageLabel}
                    today={today}
                  />
                )}
              />
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" className={styles.fieldGrid}>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      label="Số lượng ban đầu"
                      description="Tổng số con trong lứa"
                      min={1}
                      allowNegative={false}
                      decimalScale={0}
                      required
                      disabled={fieldsDisabled}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(typeof val === "number" ? val : 1);
                        void trigger("quantity");
                      }}
                      onBlur={field.onBlur}
                      error={formState.errors.quantity?.message ?? capacityError ?? undefined}
                    />
                  )}
                />
                <Stack gap={6} className={styles.genderBlock} justify="flex-end">
                  <Text size="sm" fw={500} className={styles.genderLabel}>
                    Giới tính
                  </Text>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <SegmentedControl
                        fullWidth
                        data={genderData}
                        aria-label="Giới tính đàn"
                        disabled={fieldsDisabled}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </Stack>
              </SimpleGrid>
            </section>

            <section className={styles.section}>
              <Title order={5} className={styles.sectionTitle}>
                Giai đoạn phát triển
              </Title>
              <Text size="sm" c="dimmed" className={styles.sectionHint}>
                Mặc định tự tính từ ngày sinh: {DEVELOPMENT_STAGE_LABELS[inferredStage]}
              </Text>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" className={styles.fieldGrid}>
                <Controller
                  name="stage_override"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      label="Ghi đè giai đoạn tự động"
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.currentTarget.checked)}
                      disabled={fieldsDisabled}
                    />
                  )}
                />
                {stageOverride ? (
                  <Controller
                    name="development_stage"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Giai đoạn"
                        data={stageOptions}
                        value={field.value ?? inferredStage}
                        onChange={field.onChange}
                        disabled={fieldsDisabled}
                      />
                    )}
                  />
                ) : null}
              </SimpleGrid>
            </section>

            <section className={styles.section}>
              <Title order={5} className={styles.sectionTitle}>
                Nguồn gốc & trạng thái
              </Title>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" className={styles.fieldGrid}>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Nguồn gốc"
                      data={sourceOptions}
                      required
                      disabled={fieldsDisabled}
                      error={formState.errors.source?.message}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Trạng thái"
                      data={statusOptions}
                      required
                      disabled={fieldsDisabled}
                      error={formState.errors.status?.message}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        void trigger("quantity");
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </SimpleGrid>
              {source === "purchased" || source === "transferred" ? (
                <Controller
                  name="supplier_info"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      mt="md"
                      label="Thông tin nguồn / NCC"
                      placeholder="Tên trại, địa chỉ, hóa đơn..."
                      disabled={fieldsDisabled}
                      {...field}
                    />
                  )}
                />
              ) : null}
            </section>

            <section className={styles.section}>
              <Title order={5} className={styles.sectionTitle}>
                Ghi chú
              </Title>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Ghi chú thêm"
                    placeholder="Thông tin bổ sung về lứa (tuỳ chọn)"
                    autosize
                    minRows={3}
                    disabled={fieldsDisabled}
                    error={formState.errors.notes?.message}
                    {...field}
                  />
                )}
              />
            </section>

            <GoatBatchSummaryCard control={control} barns={barns} today={today} />
          </Stack>

          {!readOnly ? (
            <Group justify="flex-end" gap="sm" className={styles.actions}>
              <Button
                variant="default"
                type="button"
                disabled={submitting}
                onClick={() => router.push("/app/herd")}
              >
                Huỷ
              </Button>
              <Button
                variant="light"
                type="button"
                disabled={submitting}
                onClick={() => reset(defaultGoatBatchFormValues)}
              >
                Đặt lại
              </Button>
              <Button type="submit" loading={submitting}>
                Lưu đàn
              </Button>
            </Group>
          ) : null}
        </form>
      </Paper>
    </Stack>
  );
}
