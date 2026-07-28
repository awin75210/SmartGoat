"use client";

import Link from "next/link";
import { Paper, Text } from "@mantine/core";
import styles from "./GuestDemoBanner.module.css";

export function GuestDemoBanner() {
  return (
    <Paper withBorder radius="md" p="md" className={styles.banner}>
      <Text size="sm">
        <Text component="span" fw={600}>
          Chế độ xem thử.
        </Text>{" "}
        Bạn đang xem dữ liệu demo trang trại mẫu, không cần đăng nhập.{" "}
        <Link href="/login" className={styles.link}>
          Đăng nhập
        </Link>{" "}
        khi cần lưu thay đổi hoặc quản lý tài khoản riêng.
      </Text>
    </Paper>
  );
}
