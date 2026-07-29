"use client";

import { useState } from "react";
import { Button, Group, Select, Stack, Tabs, Text } from "@mantine/core";
import {
  ALERT_LEVEL_COLORS,
  ALERT_LEVEL_LABELS,
  type AlertLevel,
} from "@/shared/constants/alert-levels";
import { formatDateTimeVi } from "@/shared/utils/format";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import { markAlertResolvedAction } from "../actions/alert.actions";
import type { Alert, AlertListFilter } from "../types/alert.types";
import styles from "./AlertsPage.module.css";

type AlertsPageProps = {
  initialAlerts: Alert[];
};

export function AlertsPage({ initialAlerts }: AlertsPageProps) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<AlertListFilter>({ tab: "active", level: "all" });
  const [pending, setPending] = useState(false);

  const filtered = alerts.filter((a) => {
    if (filter.tab === "active" && a.isResolved) return false;
    if (filter.tab === "resolved" && !a.isResolved) return false;
    if (filter.level && filter.level !== "all" && a.level !== filter.level) return false;
    return true;
  });

  const handleResolve = (alertId: string) => {
    void (async () => {
      setPending(true);
      try {
        const result = await markAlertResolvedAction({ alertId });
        if (result.ok) {
          setAlerts((prev) => prev.map((a) => (a.id === alertId ? result.data : a)));
        }
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <Stack gap="lg" className={styles.page}>
      <PageHeader title="Cảnh báo" description="Theo dõi và xử lý sự kiện trại nuôi" />
      <Tabs
        value={filter.tab}
        onChange={(v) => setFilter((f) => ({ ...f, tab: (v as AlertListFilter["tab"]) ?? "active" }))}
      >
        <Tabs.List>
          <Tabs.Tab value="active">Đang mở</Tabs.Tab>
          <Tabs.Tab value="resolved">Đã xử lý</Tabs.Tab>
          <Tabs.Tab value="all">Tất cả</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <Select
        maw={240}
        label="Mức độ"
        data={[
          { value: "all", label: "Tất cả" },
          ...(["low", "medium", "high"] as AlertLevel[]).map((level) => ({
            value: level,
            label: ALERT_LEVEL_LABELS[level],
          })),
        ]}
        value={filter.level ?? "all"}
        onChange={(v) =>
          setFilter((f) => ({ ...f, level: (v as AlertListFilter["level"]) ?? "all" }))
        }
      />
      <Stack gap="sm">
        {filtered.map((alert) => (
          <div key={alert.id} className={styles.card}>
            <Group justify="space-between" align="flex-start" mb="xs">
              <div>
                <Text fw={700}>{alert.title}</Text>
                <Text size="sm" c="dimmed">
                  {alert.message}
                </Text>
              </div>
              <StatusBadge
                label={ALERT_LEVEL_LABELS[alert.level]}
                color={ALERT_LEVEL_COLORS[alert.level]}
              />
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                {formatDateTimeVi(alert.triggeredAt)} · {alert.source}
              </Text>
              {!alert.isResolved ? (
                <Button
                  size="xs"
                  variant="light"
                  loading={pending}
                  onClick={() => handleResolve(alert.id)}
                >
                  Đánh dấu đã xử lý
                </Button>
              ) : (
                <Text size="xs" c="green">
                  Đã xử lý
                </Text>
              )}
            </Group>
          </div>
        ))}
      </Stack>
    </Stack>
  );
}
