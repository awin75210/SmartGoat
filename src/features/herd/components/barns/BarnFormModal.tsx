"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, LoadingOverlay, Modal, NumberInput, Stack, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { runWithNotification } from "@/shared/utils/async-notification";
import { createBarnAction, updateBarnAction } from "../../actions/barn.actions";
import { createBarnSchema, type CreateBarnSchemaInput } from "../../schemas/barn.schema";
import type { Barn } from "../../types/barn.types";
import styles from "./BarnFormModal.module.css";

type BarnFormModalProps = {
  mode: "create" | "edit";
  barn?: Barn;
  opened: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export function BarnFormModal({ mode, barn, opened, onClose, onSaved }: BarnFormModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBarnSchemaInput>({
    defaultValues: { name: "", capacity: null },
    resolver: zodResolver(createBarnSchema),
  });

  useEffect(() => {
    if (!opened) return;
    if (mode === "edit" && barn) {
      reset({ name: barn.name, capacity: barn.capacity });
      return;
    }
    reset({ name: "", capacity: null });
  }, [opened, mode, barn, reset]);

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    void (async () => {
      const notifyId = mode === "create" ? "barn-create" : `barn-edit-${barn?.id ?? "unknown"}`;
      const result = await runWithNotification(
        notifyId,
        {
          loading: mode === "create" ? "Đang tạo chuồng…" : "Đang cập nhật chuồng…",
          success:
            mode === "create"
              ? `Đã tạo chuồng ${values.name}`
              : `Đã cập nhật chuồng ${values.name}`,
          error: "Không lưu được thông tin chuồng",
        },
        async () => {
          if (mode === "edit") {
            if (!barn) return { ok: false, message: "Không tìm thấy chuồng" };
            return updateBarnAction(barn.id, values);
          }
          return createBarnAction(values);
        },
      );

      if (!result.ok) return;

      reset();
      onClose();
      onSaved?.();
    })();
  });

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={mode === "create" ? "Thêm chuồng" : "Sửa chuồng"}
      centered
      size="sm"
      closeOnClickOutside={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <form className={styles.form} onSubmit={onSubmit}>
        <Stack gap="md" pos="relative">
          <LoadingOverlay visible={isSubmitting} zIndex={1000} overlayProps={{ radius: "md" }} />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Tên chuồng"
                placeholder="VD: Chuồng A"
                required
                disabled={isSubmitting}
                error={errors.name?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="capacity"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Sức chứa"
                description="Số con tối đa trong chuồng (tuỳ chọn)"
                placeholder="VD: 24"
                min={1}
                max={9999}
                disabled={isSubmitting}
                value={field.value ?? ""}
                onChange={(val) => field.onChange(typeof val === "number" ? val : null)}
                error={errors.capacity?.message}
              />
            )}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" type="button" onClick={handleClose} disabled={isSubmitting}>
              Huỷ
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {mode === "create" ? "Lưu chuồng" : "Cập nhật"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
