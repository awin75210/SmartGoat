import { Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconUsersGroup } from "@tabler/icons-react";

export function GoatBatchFormHeader() {
  return (
    <Group gap="md" align="flex-start" wrap="nowrap">
      <ThemeIcon size={48} radius="lg" variant="light" color="capraBlue">
        <IconUsersGroup size={26} stroke={1.5} />
      </ThemeIcon>
      <Stack gap={4}>
        <Title order={2}>Quản lý đàn/lứa</Title>
        <Text c="dimmed" size="sm">
          Theo dõi đàn theo ngày sinh và số lượng.
        </Text>
      </Stack>
    </Group>
  );
}
