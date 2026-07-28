"use client";

import { Group, Pagination, Text } from "@mantine/core";
import styles from "./AppPagination.module.css";

type AppPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
};

export function AppPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onChange,
}: AppPaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <Group justify="space-between" className={styles.root} wrap="wrap">
      <Text size="sm" c="dimmed">
        Hiển thị {from}–{to} / {totalItems}
      </Text>
      <Pagination value={page} onChange={onChange} total={Math.max(totalPages, 1)} />
    </Group>
  );
}
