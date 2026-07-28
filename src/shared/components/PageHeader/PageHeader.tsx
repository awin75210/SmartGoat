import { Group, Stack, Text, Title } from "@mantine/core";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap" className={styles.root}>
      <Stack gap={4}>
        <Title order={2} className={styles.title}>
          {title}
        </Title>
        {description ? (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        ) : null}
      </Stack>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </Group>
  );
}
