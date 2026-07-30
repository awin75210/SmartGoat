import { Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Stack align="center" gap="sm" className={styles.root} py="xl">
      <ThemeIcon size={56} radius="xl" variant="light" color="capraBlue">
        {icon ?? <IconInbox size={28} stroke={1.5} />}
      </ThemeIcon>
      <Title order={4} className={styles.title}>
        {title}
      </Title>
      {description ? (
        <Text size="sm" c="dimmed" ta="center" maw={420}>
          {description}
        </Text>
      ) : null}
      {action}
    </Stack>
  );
}
