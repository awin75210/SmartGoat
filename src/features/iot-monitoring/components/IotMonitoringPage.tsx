"use client";

import { useState, useTransition } from "react";
import { Stack } from "@mantine/core";
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton/LoadingSkeleton";
import type { AlertSummary } from "@/features/alerts/types/alert.types";
import type { HerdOverviewStats } from "@/features/herd/types/herd.types";
import { fetchIotMonitoringAction } from "../actions/iot.actions";
import type { IotMonitoringSnapshot, IotTimeRange } from "../types/iot.types";
import { IotBarnStatus } from "./IotBarnStatus";
import { IotHerdOverview } from "./IotHerdOverview";
import { IotLatestAlerts } from "./IotLatestAlerts";
import { IotMainChart } from "./IotMainChart";
import { IotMetricCards } from "./IotMetricCards";
import { IotTimeRangeFilter } from "./IotTimeRangeFilter";
import styles from "./IotMonitoringPage.module.css";

type IotMonitoringPageProps = {
  initialSnapshot: IotMonitoringSnapshot;
  latestAlerts: AlertSummary[];
  herdStats: HerdOverviewStats;
  herdDisplaySummary: { total: number; monitoring: number; newKids: number };
};

export function IotMonitoringPage({
  initialSnapshot,
  latestAlerts,
  herdStats,
  herdDisplaySummary,
}: IotMonitoringPageProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [range, setRange] = useState<IotTimeRange>(initialSnapshot.range);
  const [pending, startTransition] = useTransition();

  const handleRangeChange = (next: IotTimeRange) => {
    setRange(next);
    startTransition(async () => {
      const result = await fetchIotMonitoringAction(next);
      if (result.ok) {
        setSnapshot(result.data);
      }
    });
  };

  return (
    <Stack gap="lg" className={styles.page}>
      <div className={styles.heroRow}>
        <div className={styles.titleBlock}>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>GIÁM SÁT IoT</h1>
            <span className={styles.onlineBadge}>
              <span className={styles.pulse} aria-hidden />
              Kết nối: Online
            </span>
          </div>
          <p className={styles.pageDesc}>Theo dõi môi trường chuồng nuôi theo thời gian thực</p>
        </div>
        <div className={styles.toolbar}>
          <IotTimeRangeFilter value={range} onChange={handleRangeChange} loading={pending} />
        </div>
      </div>

      {pending ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <>
          <IotMetricCards metrics={snapshot.metrics} sparklines={snapshot.sparklines} />
          <div className={styles.chartRow}>
            <IotMainChart data={snapshot.chartSeries} />
            <IotBarnStatus summary={snapshot.environmentSummary} />
          </div>
          <div className={styles.bottomRow}>
            <IotLatestAlerts alerts={latestAlerts} />
            <IotHerdOverview stats={herdStats} displaySummary={herdDisplaySummary} />
          </div>
        </>
      )}
    </Stack>
  );
}
