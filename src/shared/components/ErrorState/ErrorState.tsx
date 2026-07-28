import { Button, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import styles from "./ErrorState.module.css";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Đã xảy ra lỗi",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <Stack align="center" gap="sm" className={styles.root} py="xl">
      <ThemeIcon size={56} radius="xl" variant="light" color="orange">
        <IconAlertTriangle size={28} stroke={1.5} />
      </ThemeIcon>
      <Title order={4} className={styles.title}>
        {title}
      </Title>
      <Text size="sm" c="dimmed" ta="center" maw={420}>
        {message}
      </Text>
      {onRetry ? (
        <Button variant="light" onClick={onRetry}>
          Thử lại
        </Button>
      ) : null}
    </Stack>
  );
}
