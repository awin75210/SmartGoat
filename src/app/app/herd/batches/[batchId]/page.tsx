import { notFound } from "next/navigation";
import { requireFarmContext } from "@/lib/auth/server-context";
import { barnService } from "@/features/herd/services/barn.service";
import { goatBatchService } from "@/features/herd/services/goat-batch.service";
import { journalService } from "@/features/herd/services/journal.service";
import { careReminderService } from "@/features/herd/services/care-reminder.service";
import { growthService } from "@/features/herd/services/growth.service";
import { BatchDetailPage } from "@/features/herd/components/batches/BatchDetailPage";

type PageProps = {
  params: Promise<{ batchId: string }>;
};

export default async function BatchDetailRoutePage({ params }: PageProps) {
  const { batchId } = await params;
  const { farmId, isGuest } = await requireFarmContext();

  const [batch, barns, journal, allReminders, growthRecords, projection] = await Promise.all([
    goatBatchService.getBatch(farmId, batchId),
    barnService.listBarns(farmId),
    journalService.listEntries(farmId, { batchId, limit: 100 }),
    careReminderService.listReminders(farmId),
    growthService.listRecords(farmId, batchId),
    growthService.getProjection(farmId, batchId),
  ]);

  if (!batch) notFound();

  const reminders = allReminders.filter((r) => r.batchId === batchId);

  return (
    <BatchDetailPage
      batch={batch}
      barns={barns}
      journal={journal}
      reminders={reminders}
      growthRecords={growthRecords}
      projection={projection}
      readOnly={isGuest}
    />
  );
}
