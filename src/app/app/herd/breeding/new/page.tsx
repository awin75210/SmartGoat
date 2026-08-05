import { requireFarmContext } from "@/lib/auth/server-context";
import { barnService } from "@/features/herd/services/barn.service";
import { goatBatchService } from "@/features/herd/services/goat-batch.service";
import { BreedingDoeForm } from "@/features/herd/components/breeding/BreedingDoeForm";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { Stack } from "@mantine/core";

export default async function NewBreedingDoeRoutePage() {
  const { farmId } = await requireFarmContext();
  const [barns, batches] = await Promise.all([
    barnService.listBarns(farmId),
    goatBatchService.listBatches(farmId),
  ]);

  return (
    <Stack gap="lg">
      <PageHeader title="Thêm dê sinh sản" description="Tạo hồ sơ và in tem mã vạch" />
      <BreedingDoeForm barns={barns} batches={batches} />
    </Stack>
  );
}
