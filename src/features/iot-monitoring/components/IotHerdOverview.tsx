import { Group, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { IconBuilding, IconUsers, IconUsersGroup } from "@tabler/icons-react";
import capraUi from "@/shared/styles/capra-ui.module.css";
import type { HerdOverviewStats } from "@/features/herd/types/goat-batch.types";
import styles from "./IotHerdOverview.module.css";

type IotHerdOverviewProps = {
  stats: HerdOverviewStats;
};

export function IotHerdOverview({ stats }: IotHerdOverviewProps) {
  const items = [
    { label: "Tổng số lượng", value: stats.totalQuantity, icon: IconUsers },
    { label: "Lứa đang nuôi", value: stats.activeBatchCount, icon: IconUsersGroup },
    { label: "Chuồng", value: stats.barnCount, icon: IconBuilding },
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
