"use client";

import { Button, Stack, Text, Title } from "@mantine/core";
import styles from "./error.module.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <div className={styles.wrap}>
      <Stack align="center" gap="md">
        <Title order={3}>Đã xảy ra lỗi</Title>
        <Text c="dimmed" ta="center" maw={420}>
          {error.message || "Vui lòng thử tải lại trang."}
        </Text>
        <Button onClick={reset} color="capraGreen">
          Thử lại
        </Button>
      </Stack>
    </div>
  );
}
