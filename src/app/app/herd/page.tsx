import { requireFarmContext } from "@/lib/auth/server-context";
import { barnService } from "@/features/herd/services/barn.service";
import { breedingDoeService } from "@/features/herd/services/breeding-doe.service";
import { careReminderService } from "@/features/herd/services/care-reminder.service";
import { goatBatchService } from "@/features/herd/services/goat-batch.service";
import { journalService } from "@/features/herd/services/journal.service";
import { HerdPage } from "@/features/herd/components/HerdPage";

export default async function HerdRoutePage() {
  const { farmId, isGuest } = await requireFarmContext();
  const [barns, batches, stats, does, journal, reminders] = await Promise.all([
    barnService.listBarns(farmId),
    goatBatchService.listBatches(farmId),
    goatBatchService.getOverviewStats(farmId),
    breedingDoeService.listDoes(farmId),
    journalService.listEntries(farmId, { limit: 100 }),
    careReminderService.listReminders(farmId),
  ]);

  return (
    <HerdPage
      barns={barns}
      batches={batches}
      stats={stats}
      does={does}
      journal={journal}
      reminders={reminders}
      readOnly={isGuest}
    />
  );
}
