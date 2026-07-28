"use client";

import { useTransition } from "react";
import { Button, Checkbox, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { updateSettingsAction } from "../actions/settings.actions";
import type { FarmSettings } from "../types/settings.types";
import styles from "./SettingsPage.module.css";

type SettingsPageProps = {
  settings: FarmSettings;
  readOnly?: boolean;
};

export function SettingsPage({ settings, readOnly = false }: SettingsPageProps) {
  const [pending, startTransition] = useTransition();
  const form = useForm({
    initialValues: {
      farmName: settings.farmName,
      timezone: settings.timezone,
      alertEmail: settings.alertEmail,
      notifyPush: settings.notifyPush,
      notifySms: settings.notifySms,
      temperatureHighC: settings.temperatureHighC,
      ammoniaMaxPpm: settings.ammoniaMaxPpm,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    startTransition(async () => {
      const result = await updateSettingsAction(values);
      if (result.ok) {
        notifications.show({ color: "green", message: "Đã lưu cài đặt" });
      } else {
        notifications.show({ color: "red", message: result.message });
      }
    });
  });

  const fieldLock = readOnly ? { readOnly: true } : {};
  const controlLock = readOnly ? { disabled: true } : {};

  return (
    <Stack gap="lg" className={styles.page}>
      <PageHeader
        title="Cài đặt trại"
        description={
          readOnly
            ? "Xem cấu hình mẫu — đăng nhập để chỉnh sửa"
            : "Thông báo và ngưỡng cảnh báo môi trường"
        }
      />
      <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit}>
        <Stack gap="md" className={styles.form}>
          <TextInput label="Tên trại" {...fieldLock} {...form.getInputProps("farmName")} />
          <TextInput label="Múi giờ" {...fieldLock} {...form.getInputProps("timezone")} />
          <TextInput label="Email nhận cảnh báo" {...fieldLock} {...form.getInputProps("alertEmail")} />
          <Checkbox
            label="Thông báo đẩy"
            {...controlLock}
            {...form.getInputProps("notifyPush", { type: "checkbox" })}
          />
          <Checkbox
            label="SMS (demo tắt)"
            {...controlLock}
            {...form.getInputProps("notifySms", { type: "checkbox" })}
          />
          <NumberInput
            label="Ngưỡng nhiệt độ cao (°C)"
            {...controlLock}
            {...form.getInputProps("temperatureHighC")}
          />
          <NumberInput
            label="Ngưỡng NH₃ tối đa (ppm)"
            {...controlLock}
            {...form.getInputProps("ammoniaMaxPpm")}
          />
          {!readOnly ? (
            <Button type="submit" loading={pending}>
              Lưu thay đổi
            </Button>
          ) : null}
        </Stack>
      </form>
    </Stack>
  );
}
