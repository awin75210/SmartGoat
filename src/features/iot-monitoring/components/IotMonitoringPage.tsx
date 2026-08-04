"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Stack } from "@mantine/core";
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton/LoadingSkeleton";
import type { AlertSummary } from "@/features/alerts/types/alert.types";
import type { HerdOverviewStats } from "@/features/herd/types/goat-batch.types";
import { fetchIotMonitoringAction } from "../actions/iot.actions";
import type { IotMonitoringSnapshot, IotTimeRange } from "../types/iot.types";
import { IotBarnStatus } from "./IotBarnStatus";
import { IotDeviceControl } from "./IotDeviceControl";
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
  readOnly?: boolean;
};

export function IotMonitoringPage({
  initialSnapshot,
  latestAlerts,
  herdStats,
  readOnly = false,
}: IotMonitoringPageProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [range, setRange] = useState<IotTimeRange>(initialSnapshot.range);
  const [pending, setPending] = useState(false);
  const fetchSeqRef = useRef(0);

  const handleRangeChange = (next: IotTimeRange) => {
    setRange(next);
    const seq = ++fetchSeqRef.current;
    void (async () => {
      setPending(true);
      try {
        const result = await fetchIotMonitoringAction(next);
        if (seq !== fetchSeqRef.current) return;
        if (result.ok) {
          setSnapshot(result.data);
        }
      } finally {
        if (seq === fetchSeqRef.current) {
          setPending(false);
        }
      }
    })();
  };

  const online = snapshot.gateway?.online ?? false;

  return (
    <Stack gap="lg" className={styles.page}>
      <div className={styles.heroRow}>
        <div className={styles.titleBlock}>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>GIÁM SÁT IoT</h1>
            <span className={styles.onlineBadge} data-offline={!online || undefined}>
              <span className={styles.pulse} aria-hidden />
              {snapshot.gateway?.deviceName ?? "Gateway ESP32"} —{" "}
              {online ? "Online" : "Offline"}
            </span>
          </div>
          <p className={styles.pageDesc}>
            Cảm biến realtime · Relay 4CH · Servo mái che · API ESP32
          </p>
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
          <IotDeviceControl
            actuators={snapshot.actuators}
            gateway={snapshot.gateway}
            readOnly={readOnly}
            onChanged={() => router.refresh()}
          />
          <div className={styles.chartRow}>
            <IotMainChart data={snapshot.chartSeries} />
            <IotBarnStatus summary={snapshot.environmentSummary} />
          </div>
          <div className={styles.bottomRow}>
            <IotLatestAlerts alerts={latestAlerts} />
            <IotHerdOverview stats={herdStats} />
          </div>
        </>
      )}
    </Stack>
  );
}
