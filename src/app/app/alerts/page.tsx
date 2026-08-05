import { requireFarmContext } from "@/lib/auth/server-context";
import { alertService } from "@/features/alerts/services/alert.service";
import { careReminderService } from "@/features/herd/services/care-reminder.service";
import { AlertsPage } from "@/features/alerts/components/AlertsPage";

export default async function AlertsRoutePage() {
  const { farmId } = await requireFarmContext();
  const [alerts, careReminders] = await Promise.all([
    alertService.listAlerts(farmId),
    careReminderService.listReminders(farmId).then((all) =>
      all.filter((r) => r.status === "pending" || r.status === "overdue"),
    ),
  ]);

  return <AlertsPage initialAlerts={alerts} careReminders={careReminders} />;
}
