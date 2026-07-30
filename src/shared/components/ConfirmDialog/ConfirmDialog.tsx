"use client";

import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import styles from "./ConfirmDialog.module.css";

type ConfirmDialogProps = {
  opened: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  opened,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  loading,
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal opened={opened} onClose={onCancel} title={title} centered className={styles.modal}>
      <Stack gap="md">
        <Text size="sm">{message}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button color={destructive ? "red" : "capraBlue"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
