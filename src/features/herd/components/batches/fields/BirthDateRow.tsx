"use client";

import { useState } from "react";
import { Group, Input, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import {
  formatBirthDateVi,
  isSameCalendarDay,
  startOfToday,
} from "../../../utils/age.utils";
import styles from "./BirthDateRow.module.css";

type BirthDateRowProps = {
  value: Date | null;
  onChange: (value: Date | null) => void;
  onBlur?: () => void;
  onAppliedToday?: () => void;
  error?: string;
  disabled?: boolean;
  ageLabel: string;
  today?: Date;
};

export function BirthDateRow({
  value,
  onChange,
  onBlur,
  onAppliedToday,
  error,
  disabled,
  ageLabel,
  today = new Date(),
}: BirthDateRowProps) {
  const [applyingToday, setApplyingToday] = useState(false);
  const todayStart = startOfToday(today);
  const todayLabel = formatBirthDateVi(todayStart);
  const birthIsToday = isSameCalendarDay(value, todayStart);

  const handleApplyToday = () => {
    if (disabled) return;
    setApplyingToday(true);
    onChange(todayStart);
    onAppliedToday?.();
    window.setTimeout(() => setApplyingToday(false), 280);
  };

  return (
    <Stack gap="sm" className={styles.root}>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" className={styles.dateGrid}>
        <DateInput
          label="Ngày sinh"
          description="Ngày sinh của lứa (không chọn tương lai)"
          placeholder="DD/MM/YYYY"
          required
          disabled={disabled}
          maxDate={today}
          value={value}
          onChange={(next) => {
            if (!next) {
              onChange(null);
              return;
            }
            const parsed = new Date(next);
            onChange(Number.isNaN(parsed.getTime()) ? null : parsed);
          }}
          onBlur={onBlur}
          error={error}
          valueFormat="DD/MM/YYYY"
          leftSection={<IconCalendar size={16} stroke={1.5} />}
          classNames={{ input: styles.dateInput }}
        />

        <Input.Wrapper
          label="Ngày hiện tại"
          description="Bấm để đặt ngày sinh = hôm nay"
        >
          <UnstyledButton
            type="button"
            className={styles.todayButton}
            data-active={birthIsToday || undefined}
            data-loading={applyingToday || undefined}
            onClick={handleApplyToday}
            disabled={disabled}
            aria-label="Đặt ngày sinh bằng ngày hiện tại"
          >
            <IconClock size={16} stroke={1.5} className={styles.todayIcon} />
            <Text span fw={600} size="sm">
              {todayLabel}
            </Text>
          </UnstyledButton>
        </Input.Wrapper>
      </SimpleGrid>

      <Group gap="sm" className={styles.ageBadge} wrap="wrap">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} className={styles.ageLabel}>
          Tuổi hiện tại
        </Text>
        <Text size="sm" fw={700} c="capraBlue" className={styles.ageValue}>
          {ageLabel}
        </Text>
      </Group>
    </Stack>
  );
}
