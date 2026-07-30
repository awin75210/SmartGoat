"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { createFarmAction } from "../actions/admin.actions";
import styles from "./AdminCreateFarmModal.module.css";

type AdminCreateFarmModalProps = {
  opened: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function AdminCreateFarmModal({ opened, onClose, onCreated }: AdminCreateFarmModalProps) {
  const [pending, setPending] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      location: "",
      ownerFullName: "",
      ownerEmail: "",
      ownerPassword: "",
      goatCount: 0,
    },
    validate: {
      name: (v) => (v.trim().length >= 2 ? null : "Tên trại tối thiểu 2 ký tự"),
      location: (v) => (v.trim().length >= 2 ? null : "Khu vực tối thiểu 2 ký tự"),
      ownerFullName: (v) => (v.trim().length >= 2 ? null : "Họ tên tối thiểu 2 ký tự"),
      ownerEmail: (v) => (/^\S+@\S+$/.test(v) ? null : "Email không hợp lệ"),
      ownerPassword: (v) => (v.length >= 6 ? null : "Mật khẩu tối thiểu 6 ký tự"),
    },
  });

  const handleClose = () => {
    if (pending) return;
    form.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit((values) => {
    void (async () => {
      setPending(true);
      try {
        const result = await createFarmAction(values);
        if (!result.ok) {
          notifications.show({ color: "red", message: result.message });
          return;
        }
        const { farm, owner, note } = result.data;
        notifications.show({
          color: "green",
          title: "Đã tạo trang trại",
          message: owner
            ? `${farm.name} — chủ trại ${owner.email} có thể đăng nhập ngay.`
            : note ?? `${farm.name} đã được tạo.`,
        });
        form.reset();
        onCreated?.();
        onClose();
      } finally {
        setPending(false);
      }
    })();
  });

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Thêm trang trại mới"
      size="md"
      classNames={{ title: styles.title }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Mỗi trang trại mới sẽ được cấp bộ thiết bị IoT riêng (cảm biến, gateway, quạt) và dữ liệu
            giám sát demo.
          </Text>
          <TextInput label="Tên trang trại" required {...form.getInputProps("name")} />
          <TextInput label="Khu vực" required {...form.getInputProps("location")} />
          <NumberInput
            label="Số dê (ước tính)"
            min={0}
            {...form.getInputProps("goatCount")}
          />
          <Text fw={600} size="sm" mt="xs">
            Chủ trại
          </Text>
          <TextInput label="Họ tên" required {...form.getInputProps("ownerFullName")} />
          <TextInput label="Email đăng nhập" required {...form.getInputProps("ownerEmail")} />
          <TextInput
            label="Mật khẩu"
            type="password"
            required
            description="Chế độ demo: mật khẩu lưu trong seed. Supabase: tạo user thủ công nếu cần."
            {...form.getInputProps("ownerPassword")}
          />
          <Button type="submit" loading={pending} color="capraBlue">
            Tạo trang trại + IoT
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
