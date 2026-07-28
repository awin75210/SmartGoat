"use client";

import Link from "next/link";
import {
  Anchor,
  Group,
  Paper,
  ScrollArea,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { ALERT_LEVEL_COLORS, ALERT_LEVEL_LABELS } from "@/shared/constants/alert-levels";
import { formatDateTimeVi } from "@/shared/utils/format";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import capraUi from "@/shared/styles/capra-ui.module.css";
import type { AlertSummary } from "@/features/alerts/types/alert.types";
import styles from "./IotLatestAlerts.module.css";

type IotLatestAlertsProps = {
  alerts: AlertSummary[];
};

export function IotLatestAlerts({ alerts }: IotLatestAlertsProps) {
  return (
    <Paper radius="md" p="md" className={`${capraUi.capraCard} ${styles.card}`}>
      <Group justify="space-between" mb="md">
        <Title order={4} className={capraUi.capraCardTitle}>
          Cảnh báo mới nhất
        </Title>
      </Group>
      <ScrollArea type="auto" offsetScrollbars>
        <Table striped highlightOnHover withTableBorder className={styles.table}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Mức độ</Table.Th>
              <Table.Th>Loại cảnh báo</Table.Th>
              <Table.Th>Địa điểm</Table.Th>
              <Table.Th visibleFrom="sm">Thời gian</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Thao tác</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {alerts.map((alert) => (
              <Table.Tr key={alert.id}>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <IconAlertTriangle
                      size={16}
                      color={ALERT_LEVEL_COLORS[alert.level]}
                      stroke={1.8}
                    />
                    <StatusBadge
                      label={ALERT_LEVEL_LABELS[alert.level]}
                      color={ALERT_LEVEL_COLORS[alert.level]}
                    />
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{alert.alertType}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{alert.location}</Text>
                </Table.Td>
                <Table.Td visibleFrom="sm">
                  <Text size="xs">{formatDateTimeVi(alert.triggeredAt)}</Text>
                </Table.Td>
                <Table.Td>
                  <StatusBadge
                    label={alert.isResolved ? "Đã xử lý" : "Chưa xử lý"}
                    color={alert.isResolved ? "#40c057" : "#fab005"}
                  />
                </Table.Td>
                <Table.Td>
                  <Anchor component={Link} href="/app/alerts" size="sm" fw={600} className={styles.detailLink}>
                    Chi tiết
                  </Anchor>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      <div className={styles.footer}>
        <Anchor component={Link} href="/app/alerts" size="sm" fw={600} className={styles.viewAll}>
          Xem tất cả cảnh báo &gt;
        </Anchor>
      </div>
    </Paper>
  );
}
