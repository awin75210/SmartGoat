"use client";

import { useRouter } from "next/navigation";
import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import { completeReminderAction, skipReminderAction } from "../../actions/herd-extended.actions";
import { CARE_TYPE_LABELS, REMINDER_STATUS_LABELS } from "../../constants/care.constants";
import { formatDateVi } from "../../utils/stage.utils";
import type { CareReminder } from "../../types/care.types";

const STATUS_COLORS: Record<CareReminder["status"], string> = {
  pending: "#228be6",
  done: "#40c057",
  skipped: "#868e96",
  overdue: "#e8590c",
};

type CareReminderPanelProps = {
  reminders: CareReminder[];
  readOnly?: boolean;
  compact?: boolean;
};

export function CareReminderPanel({
  reminders,
  readOnly = false,
  compact = false,
}: CareReminderPanelProps) {
  const router = useRouter();

  const handleComplete = (id: string) => {
    void (async () => {
      await completeReminderAction(id);
      router.refresh();
    })();
  };

  const handleSkip = (id: string) => {
    void (async () => {
      await skipReminderAction(id);
      router.refresh();
    })();
  };

  const sorted = [...reminders].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <Paper radius="lg" shadow="sm" p={compact ? "md" : "lg"}>
      <Stack gap="md">
        {!compact ? (
          <div>
            <Text fw={700}>Lịch nhắc chăm sóc</Text>
            <Text size="sm" c="dimmed">
              Tiêm phòng, tẩy giun, khẩu phần theo giai đoạn
            </Text>
          </div>
        ) : null}

        <ResponsiveDataView
          data={sorted}
          getRowKey={(r) => r.id}
          emptyState={<Text size="sm" c="dimmed">Không có nhắc nhở sắp tới.</Text>}
          columns={[
            { key: "due", header: "Hạn", render: (r) => formatDateVi(r.dueDate) },
            { key: "title", header: "Nội dung", render: (r) => <Text fw={600}>{r.title}</Text> },
            {
              key: "type",
              header: "Loại",
              render: (r) => CARE_TYPE_LABELS[r.careType],
            },
            {
              key: "target",
              header: "Đối tượng",
              render: (r) => r.batchName ?? r.doeName ?? "—",
            },
            {
              key: "status",
              header: "Trạng thái",
              render: (r) => (
                <StatusBadge
                  label={REMINDER_STATUS_LABELS[r.status]}
                  color={STATUS_COLORS[r.status]}
                />
              ),
            },
            {
              key: "actions",
              header: "",
              render: (r) =>
                !readOnly && (r.status === "pending" || r.status === "overdue") ? (
                  <Group gap={4} wrap="nowrap">
                    <Button size="xs" variant="light" onClick={() => handleComplete(r.id)}>
                      Xong
                    </Button>
                    <Button size="xs" variant="subtle" onClick={() => handleSkip(r.id)}>
                      Bỏ qua
                    </Button>
                  </Group>
                ) : null,
            },
          ]}
          mobileCard={(r) => (
            <Stack gap={4}>
              <Group justify="space-between">
                <Text fw={700}>{r.title}</Text>
                <StatusBadge
                  label={REMINDER_STATUS_LABELS[r.status]}
                  color={STATUS_COLORS[r.status]}
                />
              </Group>
              <Text size="sm">
                {formatDateVi(r.dueDate)} · {CARE_TYPE_LABELS[r.careType]}
              </Text>
              {!readOnly && (r.status === "pending" || r.status === "overdue") ? (
                <Group>
                  <Button size="xs" onClick={() => handleComplete(r.id)}>
                    Hoàn thành
                  </Button>
                  <Button size="xs" variant="subtle" onClick={() => handleSkip(r.id)}>
                    Bỏ qua
                  </Button>
                </Group>
              ) : null}
            </Stack>
          )}
        />
      </Stack>
    </Paper>
  );
}
