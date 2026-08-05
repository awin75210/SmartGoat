"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Group, Paper, Select, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { formatDateTimeVi } from "@/shared/utils/format";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import { createJournalEntryAction } from "../../actions/herd-extended.actions";
import {
  JOURNAL_ENTRY_TYPES,
  JOURNAL_ENTRY_TYPE_LABELS,
} from "../../constants/journal.constants";
import type { GoatBatch } from "../../types/goat-batch.types";
import type { BreedingDoe } from "../../types/breeding-doe.types";
import type { JournalEntry } from "../../types/journal.types";

type JournalPanelProps = {
  entries: JournalEntry[];
  batches: GoatBatch[];
  does: BreedingDoe[];
  readOnly?: boolean;
  defaultBatchId?: string;
  defaultDoeId?: string;
};

export function JournalPanel({
  entries,
  batches,
  does,
  readOnly = false,
  defaultBatchId,
  defaultDoeId,
}: JournalPanelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [entryType, setEntryType] = useState<(typeof JOURNAL_ENTRY_TYPES)[number]>("note");
  const [batchId, setBatchId] = useState<string | null>(defaultBatchId ?? null);
  const [doeId, setDoeId] = useState<string | null>(defaultDoeId ?? null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  const handleCreate = () => {
    void (async () => {
      setPending(true);
      try {
        const result = await createJournalEntryAction({
          entry_type: entryType,
          batch_id: batchId,
          doe_id: doeId,
          title,
          body: body || null,
        });
        if (result.ok) {
          setOpen(false);
          setTitle("");
          setBody("");
          router.refresh();
        }
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <Paper radius="lg" shadow="sm" p="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Text fw={700}>Nhật ký chăn nuôi</Text>
            <Text size="sm" c="dimmed">
              {entries.length} bản ghi
            </Text>
          </div>
          {!readOnly ? (
            <Button
              size="sm"
              leftSection={<IconPlus size={14} />}
              onClick={() => setOpen((v) => !v)}
            >
              Ghi nhật ký
            </Button>
          ) : null}
        </Group>

        {open && !readOnly ? (
          <Stack gap="sm">
            <Select
              label="Loại sự kiện"
              data={JOURNAL_ENTRY_TYPES.map((t) => ({
                value: t,
                label: JOURNAL_ENTRY_TYPE_LABELS[t],
              }))}
              value={entryType}
              onChange={(v) => setEntryType(v as typeof entryType)}
            />
            <Select
              label="Lứa (tuỳ chọn)"
              clearable
              data={batches.map((b) => ({ value: b.id, label: `${b.name} (${b.batchCode})` }))}
              value={batchId}
              onChange={setBatchId}
            />
            <Select
              label="Dê sinh sản (tuỳ chọn)"
              clearable
              data={does.map((d) => ({ value: d.id, label: `${d.name} (${d.tagCode})` }))}
              value={doeId}
              onChange={setDoeId}
            />
            <TextInput label="Tiêu đề" required value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
            <Textarea label="Nội dung" value={body} onChange={(e) => setBody(e.currentTarget.value)} minRows={2} />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setOpen(false)}>
                Huỷ
              </Button>
              <Button loading={pending} disabled={!title.trim()} onClick={handleCreate}>
                Lưu
              </Button>
            </Group>
          </Stack>
        ) : null}

        <ResponsiveDataView
          data={entries}
          getRowKey={(e) => e.id}
          emptyState={<Text size="sm" c="dimmed">Chưa có nhật ký.</Text>}
          columns={[
            {
              key: "date",
              header: "Thời gian",
              render: (e) => formatDateTimeVi(e.recordedAt),
            },
            {
              key: "type",
              header: "Loại",
              render: (e) => JOURNAL_ENTRY_TYPE_LABELS[e.entryType],
            },
            { key: "title", header: "Tiêu đề", render: (e) => <Text fw={600}>{e.title}</Text> },
            {
              key: "ref",
              header: "Liên kết",
              render: (e) => e.batchName ?? e.doeName ?? "—",
            },
          ]}
          mobileCard={(e) => (
            <Stack gap={2}>
              <Text fw={700}>{e.title}</Text>
              <Text size="xs" c="dimmed">
                {JOURNAL_ENTRY_TYPE_LABELS[e.entryType]} · {formatDateTimeVi(e.recordedAt)}
              </Text>
              {e.body ? <Text size="sm">{e.body}</Text> : null}
            </Stack>
          )}
        />
      </Stack>
    </Paper>
  );
}
