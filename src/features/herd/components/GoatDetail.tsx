import { Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  GOAT_GENDER_LABELS,
  GOAT_HEALTH_COLORS,
  GOAT_HEALTH_LABELS,
} from "@/shared/constants/goat-status";
import { formatDateVi } from "@/shared/utils/format";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import type { Goat } from "../types/herd.types";
import styles from "./GoatDetail.module.css";

type GoatDetailProps = {
  goat: Goat;
};

export function GoatDetail({ goat }: GoatDetailProps) {
  return (
    <Stack gap="lg">
      <PageHeader title={goat.name} description={`Mã thẻ ${goat.tagCode}`} />
      <Paper withBorder radius="md" p="lg" className={styles.card}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <div>
            <Text size="xs" c="dimmed">
              Giống
            </Text>
            <Text fw={600}>{goat.breed}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Giới tính
            </Text>
            <Text fw={600}>{GOAT_GENDER_LABELS[goat.gender]}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Ngày sinh
            </Text>
            <Text fw={600}>{formatDateVi(goat.birthDate)}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Cân nặng
            </Text>
            <Text fw={600}>{goat.weightKg} kg</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Chuồng
            </Text>
            <Text fw={600}>{goat.barnId}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Sức khỏe
            </Text>
            <StatusBadge
              label={GOAT_HEALTH_LABELS[goat.healthStatus]}
              color={GOAT_HEALTH_COLORS[goat.healthStatus]}
            />
          </div>
        </SimpleGrid>
        {goat.notes ? (
          <Stack mt="lg" gap={4}>
            <Title order={5} className={styles.notesTitle}>
              Ghi chú chăm sóc
            </Title>
            <Text size="sm">{goat.notes}</Text>
          </Stack>
        ) : null}
      </Paper>
    </Stack>
  );
}
