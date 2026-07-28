"use client";

import { Group, SegmentedControl, Tooltip } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import type { IotTimeRange } from "../types/iot.types";
import styles from "./IotTimeRangeFilter.module.css";

const OPTIONS: { label: string; value: IotTimeRange }[] = [
  { label: "24 giờ", value: "24h" },
  { label: "7 ngày", value: "7d" },
  { label: "30 ngày", value: "30d" },
];

type IotTimeRangeFilterProps = {
  value: IotTimeRange;
  onChange: (value: IotTimeRange) => void;
  loading?: boolean;
};

export function IotTimeRangeFilter({ value, onChange, loading }: IotTimeRangeFilterProps) {
  return (
    <Group gap="sm" wrap="wrap" className={styles.wrap}>
      <SegmentedControl
        className={styles.control}
        classNames={{ label: styles.segmentLabel }}
        data={OPTIONS}
        value={value}
        onChange={(v) => onChange(v as IotTimeRange)}
        disabled={loading}
        size="sm"
        radius="md"
      />
      <Tooltip label="Chức năng tùy chọn sẽ được cập nhật">
        <span className={styles.customDisabled}>
          <IconCalendar size={15} stroke={1.6} />
          Tùy chọn
        </span>
      </Tooltip>
    </Group>
  );
}
