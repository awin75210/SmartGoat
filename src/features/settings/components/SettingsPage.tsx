"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import capraUi from "@/shared/styles/capra-ui.module.css";
import { sendTestAlertEmailAction } from "@/features/notifications/actions/notification.actions";
import { updateSettingsAction } from "../actions/settings.actions";
import { updateSettingsSchema } from "../schemas/settings.schema";
import type { FarmSettings } from "../types/settings.types";
import { settingsToFormValues, TIMEZONE_OPTIONS } from "../utils/settings-defaults";
import styles from "./SettingsPage.module.css";

function validateSettingsForm(values: ReturnType<typeof settingsToFormValues>) {
  const parsed = updateSettingsSchema.safeParse(values);
  if (parsed.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

type SettingsPageProps = {
  settings: FarmSettings;
  userEmail?: string;
  readOnly?: boolean;
  loadWarning?: string | null;
  emailConfigured?: boolean;
};

export function SettingsPage({
  settings,
  userEmail,
  readOnly = false,
  loadWarning = null,
  emailConfigured = false,
}: SettingsPageProps) {
  const [pending, setPending] = useState(false);
  const [testPending, setTestPending] = useState(false);

  const form = useForm({
    initialValues: settingsToFormValues(settings),
    validate: validateSettingsForm,
  });

  const handleSubmit = form.onSubmit((values) => {
    void (async () => {
      setPending(true);
      try {
        const result = await updateSettingsAction(values);
        if (result.ok) {
          form.setValues(settingsToFormValues(result.data.settings));
          notifications.show({ color: "green", message: "Đã lưu cài đặt vào Supabase" });
          if (result.data.emailMessage) {
            notifications.show({
              color: result.data.emailSent ? "green" : "yellow",
              message: result.data.emailMessage,
            });
          }
        } else {
          notifications.show({ color: "red", message: result.message });
        }
      } finally {
        setPending(false);
      }
    })();
  });

  const handleTestEmail = () => {
    void (async () => {
      setTestPending(true);
      try {
        const saveResult = await updateSettingsAction(form.values);
        if (!saveResult.ok) {
          notifications.show({ color: "red", message: saveResult.message });
          return;
        }
        form.setValues(settingsToFormValues(saveResult.data.settings));

        const testResult = await sendTestAlertEmailAction();
        if (testResult.ok) {
          notifications.show({ color: "green", message: testResult.data.message });
        } else {
          notifications.show({ color: "red", message: testResult.message });
        }
      } finally {
        setTestPending(false);
      }
    })();
  };

  const fieldLock = readOnly ? { readOnly: true } : {};
  const controlLock = readOnly ? { disabled: true } : {};

  return (
    <Stack gap="lg" className={styles.page}>
      <PageHeader
        title="Cài đặt trại"
        description={
          readOnly
            ? "Xem cấu hình mẫu — đăng nhập để chỉnh sửa và lưu lên Supabase"
            : "Thông tin trại, thông báo và ngưỡng cảnh báo — lưu theo trại trên Supabase."
        }
      />

      {loadWarning ? (
        <Alert color="yellow" variant="light">
          {loadWarning}
        </Alert>
      ) : null}

      {!readOnly && !emailConfigured ? (
        <Alert color="blue" variant="light">
          Để gửi email thật, thêm <strong>RESEND_API_KEY</strong> vào <strong>.env.local</strong>{" "}
          (đăng ký miễn phí tại resend.com). Mặc định gửi từ{" "}
          <strong>onboarding@resend.dev</strong> — chỉ gửi được tới email đã xác minh trên Resend
          cho đến khi bạn thêm domain riêng.
        </Alert>
      ) : null}

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
              <TextInput
                label="Tên trại"
                placeholder="VD: Trang trại CapraCare"
                {...fieldLock}
                {...form.getInputProps("farmName")}
              />
              <Select
                label="Múi giờ"
                data={[...TIMEZONE_OPTIONS]}
                allowDeselect={false}
                {...controlLock}
                {...form.getInputProps("timezone")}
              />
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
                  placeholder="email@example.com"
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
                  description="Gửi email thật khi lưu cài đặt và khi nhiệt độ/NH₃ vượt ngưỡng"
                  {...controlLock}
                  {...form.getInputProps("notifyEmail", { type: "checkbox" })}
                />
                <Checkbox
                  label="Thông báo đẩy (push)"
                  description="Nhận thông báo trên trình duyệt/thiết bị"
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
                min={15}
                max={45}
                {...controlLock}
                {...form.getInputProps("temperatureHighC")}
              />
              <NumberInput
                label="Ngưỡng NH₃ tối đa"
                suffix=" ppm"
                decimalScale={1}
                min={1}
                max={50}
                {...controlLock}
                {...form.getInputProps("ammoniaMaxPpm")}
              />
            </SimpleGrid>
          </section>

          {!readOnly ? (
            <Group justify="flex-end" className={styles.actions}>
              <Button
                type="button"
                variant="light"
                loading={testPending}
                disabled={pending}
                onClick={handleTestEmail}
              >
                Gửi email thử
              </Button>
              <Button type="submit" loading={pending} disabled={testPending} className={styles.submitBtn}>
                Lưu thay đổi
              </Button>
            </Group>
          ) : null}
        </Stack>
      </form>
    </Stack>
  );
}
