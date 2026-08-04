import Link from "next/link";
import { Stack, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { requireFarmContext } from "@/lib/auth/server-context";
import { barnService } from "@/features/herd/services/barn.service";
import { herdService } from "@/features/herd/services/herd.service";
import { GoatBatchForm } from "@/features/herd/components/batches/GoatBatchForm";
import styles from "./new.module.css";

export default async function NewGoatBatchPage() {
  const { farmId, isGuest } = await requireFarmContext();
  const [barns, batches] = await Promise.all([
    barnService.listBarns(farmId),
    herdService.listBatches(farmId),
  ]);

  return (
    <Stack gap="md">
      <Link href="/app/herd" className={styles.backLink}>
        <IconArrowLeft size={16} stroke={1.5} aria-hidden />
        Quay lại Đàn dê
      </Link>
      {isGuest ? (
        <Text c="dimmed" size="sm">
          Chế độ khách — chỉ xem. Đăng nhập để thêm đàn/lứa.
        </Text>
      ) : null}
      <GoatBatchForm barns={barns} batches={batches} readOnly={isGuest} />
    </Stack>
  );
}
