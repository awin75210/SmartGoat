"use client";

import Link from "next/link";
import { Button, Group, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconMessageChatbot } from "@tabler/icons-react";

type HandbookSearchAiModalProps = {
  opened: boolean;
  searchQuery: string;
  onClose: () => void;
};

export function HandbookSearchAiModal({
  opened,
  searchQuery,
  onClose,
}: HandbookSearchAiModalProps) {
  const aiHref = `/app/ai-assistant?q=${encodeURIComponent(searchQuery)}`;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Không tìm thấy trong sổ tay"
      centered
      size="sm"
    >
      <Stack gap="md">
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <ThemeIcon size="lg" radius="md" variant="light" color="capraBlue">
            <IconMessageChatbot size={22} stroke={1.5} />
          </ThemeIcon>
          <Text size="sm">
            Không có bài viết phù hợp với{" "}
            <Text span fw={600}>
              「{searchQuery}」
            </Text>
            . Bạn có thể hỏi{" "}
            <Text span fw={600}>
              CapraCare AI
            </Text>{" "}
            — trợ lý sẽ tư vấn dựa trên kiến thức chăn nuôi dê.
          </Text>
        </Group>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Đóng
          </Button>
          <Button component={Link} href={aiHref} color="capraBlue" onClick={onClose}>
            Hỏi trợ lý AI
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
