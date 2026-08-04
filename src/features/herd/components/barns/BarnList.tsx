"use client";

import { useMemo, useState } from "react";
import { ActionIcon, Button, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBuilding, IconPencil, IconPlus } from "@tabler/icons-react";
import type { Barn } from "../../types/barn.types";
import type { GoatBatch } from "../../types/goat-batch.types";
import { getBarnOccupiedQuantity } from "../../utils/barn-capacity.utils";
import { BarnFormModal } from "./BarnFormModal";
import styles from "./BarnList.module.css";

type BarnListProps = {
  barns: Barn[];
  batches?: GoatBatch[];
  readOnly?: boolean;
  onChanged?: () => void;
};

export function BarnList({ barns, batches = [], readOnly = false, onChanged }: BarnListProps) {
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editingBarn, setEditingBarn] = useState<Barn | null>(null);

  const occupancyByBarn = useMemo(() => {
    const map = new Map<string, number>();
    for (const barn of barns) {
      map.set(barn.id, getBarnOccupiedQuantity(batches, barn.id));
    }
    return map;
  }, [barns, batches]);

  const handleCloseEdit = () => setEditingBarn(null);

  return (
    <>
      <Paper radius="lg" shadow="sm" p="lg" className={styles.card}>
        <Group justify="space-between" mb="md" wrap="wrap">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="capraBlue">
              <IconBuilding size={20} stroke={1.5} />
            </ThemeIcon>
            <div>
              <Text fw={700}>Chuồng nuôi</Text>
              <Text size="sm" c="dimmed">
                {barns.length} chuồng — tạo chuồng trước khi thêm đàn/lứa
              </Text>
            </div>
          </Group>
          {!readOnly ? (
            <Button leftSection={<IconPlus size={16} />} variant="light" onClick={openCreate}>
              Thêm chuồng
            </Button>
          ) : null}
        </Group>

        {barns.length === 0 ? (
          <Text size="sm" c="dimmed">
            Chưa có chuồng. {!readOnly ? "Bấm 「Thêm chuồng」 để bắt đầu." : ""}
          </Text>
        ) : (
          <Stack gap="xs">
            {barns.map((barn) => {
              const occupied = occupancyByBarn.get(barn.id) ?? 0;
              return (
                <div key={barn.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <Text fw={600}>{barn.name}</Text>
                    <Text size="sm" c="dimmed">
                      {barn.capacity
                        ? `Sức chứa ${barn.capacity} con · Đang nuôi ${occupied} con`
                        : "Chưa cập nhật sức chứa"}
                    </Text>
                  </div>
                  {!readOnly ? (
                    <ActionIcon
                      variant="subtle"
                      color="capraBlue"
                      aria-label={`Sửa ${barn.name}`}
                      onClick={() => setEditingBarn(barn)}
                    >
                      <IconPencil size={16} stroke={1.5} />
                    </ActionIcon>
                  ) : null}
                </div>
              );
            })}
          </Stack>
        )}
      </Paper>

      {!readOnly ? (
        <>
          <BarnFormModal
            mode="create"
            opened={createOpened}
            onClose={closeCreate}
            onSaved={() => {
              onChanged?.();
            }}
          />
          <BarnFormModal
            mode="edit"
            barn={editingBarn ?? undefined}
            opened={Boolean(editingBarn)}
            onClose={handleCloseEdit}
            onSaved={() => {
              handleCloseEdit();
              onChanged?.();
            }}
          />
        </>
      ) : null}
    </>
  );
}
