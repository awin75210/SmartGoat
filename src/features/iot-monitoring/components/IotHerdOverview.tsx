import { Group, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { IconBabyCarriage, IconEye, IconUsers } from "@tabler/icons-react";
import capraUi from "@/shared/styles/capra-ui.module.css";
import type { HerdOverviewStats } from "@/features/herd/types/herd.types";
import styles from "./IotHerdOverview.module.css";

type IotHerdOverviewProps = {
  stats: HerdOverviewStats;
  displaySummary?: { total: number; monitoring: number; newKids: number };
};

export function IotHerdOverview({ stats, displaySummary }: IotHerdOverviewProps) {
  const total = displaySummary?.total ?? stats.totalGoats;
  const monitoring = displaySummary?.monitoring ?? stats.monitoringCount;
  const newKids = displaySummary?.newKids ?? stats.kidCount;

  const items = [
    { label: "Tổng đàn", value: total, icon: IconUsers },
    { label: "Cần theo dõi", value: monitoring, icon: IconEye },
    { label: "Dê con mới", value: newKids, icon: IconBabyCarriage },
  ];

  return (
    <Paper radius="md" p="md" className={`${capraUi.capraCard} ${styles.card}`}>
      <Title order={4} className={capraUi.capraCardTitle} mb="md">
        Tổng quan đàn dê
      </Title>
      <SimpleGrid cols={3} spacing="sm" mb="md">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={styles.stat}>
              <Icon size={22} stroke={1.6} className={styles.statIcon} />
              <Text fw={800} size="xl" className={styles.value}>
                {item.value}
              </Text>
              <Text size="xs" c="dimmed" ta="center" fw={600}>
                {item.label}
              </Text>
            </div>
          );
        })}
      </SimpleGrid>
      <div className={styles.scene} aria-hidden>
        <div className={styles.sceneHill} />
        <div className={styles.sceneGoat} />
        <div className={`${styles.sceneGoat} ${styles.sceneGoatAlt}`} />
      </div>
      <Group justify="center" gap={6} className={styles.banner}>
        <Text size="sm" fw={600}>
          Môi trường tốt — Dê khỏe mạnh — Năng suất cao
        </Text>
      </Group>
    </Paper>
  );
}
