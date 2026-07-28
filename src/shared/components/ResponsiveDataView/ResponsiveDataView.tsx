"use client";

import { Box, Stack, Table } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";
import styles from "./ResponsiveDataView.module.css";

export type ResponsiveColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
};

type ResponsiveDataViewProps<T> = {
  data: T[];
  columns: ResponsiveColumn<T>[];
  getRowKey: (row: T) => string;
  mobileCard: (row: T) => React.ReactNode;
  emptyState?: React.ReactNode;
};

export function ResponsiveDataView<T>({
  data,
  columns,
  getRowKey,
  mobileCard,
  emptyState,
}: ResponsiveDataViewProps<T>) {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.mobile}px)`);

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  if (isMobile) {
    return (
      <Stack gap="sm" className={styles.mobileList}>
        {data.map((row) => (
          <Box key={getRowKey(row)} className={styles.mobileCard}>
            {mobileCard(row)}
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table striped highlightOnHover className={styles.table}>
        <Table.Thead>
          <Table.Tr>
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((col) => (
                <Table.Th key={col.key}>{col.header}</Table.Th>
              ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((row) => (
            <Table.Tr key={getRowKey(row)}>
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((col) => (
                  <Table.Td key={col.key}>{col.render(row)}</Table.Td>
                ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
