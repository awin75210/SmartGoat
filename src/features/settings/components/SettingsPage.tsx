"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import capraUi from "@/shared/styles/capra-ui.module.css";
import { updateSettingsAction } from "../actions/settings.actions";
import type { FarmSettings } from "../types/settings.types";
import styles from "./SettingsPage.module.css";

type SettingsPageProps = {
  settings: FarmSettings;
  userEmail?: string;
  readOnly?: boolean;
};

export function SettingsPage({ settings, userEmail, readOnly = false }: SettingsPageProps) {
  const [pending, setPending] = useState(false);
  const form = useForm({
    initialValues: {
      farmName: settings.farmName,
      timezone: settings.timezone,
      alertEmail: settings.alertEmail,
      notifyPush: settings.notifyPush,
      notifyEmail: settings.notifyEmail,
      temperatureHighC: settings.temperatureHighC,
      ammoniaMaxPpm: settings.ammoniaMaxPpm,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    void (async () => {
      setPending(true);
      try {
        const result = await updateSettingsAction(values);
        if (result.ok) {
          notifications.show({ color: "green", message: "Đã lưu cài đặt" });
        } else {
          notifications.show({ color: "red", message: result.message });
        }
      } finally {
        setPending(false);
      }
    })();
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
            : "Cài đặt được lưu theo trại trên hệ thống. Email cảnh báo tự động sẽ được bật trong bản cập nhật tiếp theo."
        }
      />
      <form
        className={`${capraUi.capraCard} ${styles.form}`}
        onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit}
      >
        <Stack gap="xl">
          <section className={styles.section}>
            <Title order={5} className={styles.sectionTitle}>
              Thông tin trại
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" className={styles.fieldGrid}>
              <TextInput label="Tên trại" {...fieldLock} {...form.getInputProps("farmName")} />
              <TextInput label="Múi giờ" {...fieldLock} {...form.getInputProps("timezone")} />
            </SimpleGrid>
          </section>

          <section className={styles.section}>
            <Title order={5} className={styles.sectionTitle}>
              Thông báo
            </Title>
            <Stack gap="md">
              <Group align="flex-end" wrap="wrap" gap="sm" className={styles.emailRow}>
                <TextInput
                  label="Email nhận cảnh báo"
                  description="Địa chỉ nhận thông báo khi vượt ngưỡng nhiệt độ hoặc NH₃"
                  flex={1}
                  miw={240}
                  {...fieldLock}
                  {...form.getInputProps("alertEmail")}
                />
                {!readOnly && userEmail ? (
                  <Button
                    type="button"
                    variant="light"
                    size="md"
                    onClick={() => form.setFieldValue("alertEmail", userEmail)}
                  >
                    Dùng email đăng nhập
                  </Button>
                ) : null}
              </Group>
              <div className={styles.notifyGroup}>
                <Checkbox
                  label="Bật cảnh báo qua email"
                  description="Gửi email khi có cảnh báo môi trường (sắp có)"
                  {...controlLock}
                  {...form.getInputProps("notifyEmail", { type: "checkbox" })}
                />
                <Checkbox
                  label="Thông báo đẩy"
                  {...controlLock}
                  {...form.getInputProps("notifyPush", { type: "checkbox" })}
                />
              </div>
            </Stack>
          </section>

          <section className={styles.section}>
            <Title order={5} className={styles.sectionTitle}>
              Ngưỡng cảnh báo
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" className={styles.fieldGrid}>
              <NumberInput
                label="Ngưỡng nhiệt độ cao"
                suffix=" °C"
                decimalScale={1}
                {...controlLock}
                {...form.getInputProps("temperatureHighC")}
              />
              <NumberInput
                label="Ngưỡng NH₃ tối đa"
                suffix=" ppm"
                decimalScale={1}
                {...controlLock}
                {...form.getInputProps("ammoniaMaxPpm")}
              />
            </SimpleGrid>
          </section>

          {!readOnly ? (
            <Group justify="flex-end" className={styles.actions}>
              <Button type="submit" loading={pending} className={styles.submitBtn}>
                Lưu thay đổi
              </Button>
            </Group>
          ) : null}
        </Stack>
      </form>
    </Stack>
  );
}
