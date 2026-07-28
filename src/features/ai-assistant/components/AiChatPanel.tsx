"use client";

import { useRef, useState } from "react";
import { Button, Group, Paper, ScrollArea, Stack, Text, Textarea } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { formatTimeVi } from "@/shared/utils/format";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { askAiAssistantAction } from "../actions/ai-assistant.actions";
import type { AiChatMessage, AiSuggestedPrompt } from "../types/ai-assistant.types";
import styles from "./AiChatPanel.module.css";

const MOCK_DELAY_MS = 900;
const SEED_CHAT_TIME = "2025-07-21T08:00:00.000Z";

const INITIAL_MESSAGES: AiChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Xin chào! Tôi là CapraCare AI — trợ lý tư vấn chăn nuôi dê. Bạn cần hỗ trợ về sức khỏe đàn, môi trường chuồng hay dinh dưỡng?",
    createdAt: SEED_CHAT_TIME,
  },
  {
    id: "sample-user",
    role: "user",
    content: "Dê con nhà tôi bị tiêu chảy, phân lỏng màu vàng, ăn kém từ sáng nay. Tôi nên làm gì?",
    createdAt: SEED_CHAT_TIME,
  },
  {
    id: "sample-ai",
    role: "assistant",
    content:
      "Với dê con tiêu chảy cấp tính, bạn nên: (1) Cách ly khỏi đàn để tránh lây lan. (2) Bù dịch bằng dung dịch điện giải uống tự do. (3) Kiểm tra nhiệt độ và màng nhầy mắt. (4) Nếu yếu, không uống hoặc phân có máu — liên hệ thú y ngay. (5) Vệ sinh chuồng và đồ uống sạch sẽ.",
    createdAt: SEED_CHAT_TIME,
  },
];

type AiChatPanelProps = {
  suggestedPrompts: AiSuggestedPrompt[];
};

export function AiChatPanel({ suggestedPrompts }: AiChatPanelProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const idRef = useRef(0);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const userMsg: AiChatMessage = {
      id: `u-${++idRef.current}`,
      role: "user",
      content: trimmed,
      createdAt: SEED_CHAT_TIME,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPending(true);

    await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

    const result = await askAiAssistantAction(trimmed);
    const replyText = result.ok
      ? result.data.reply
      : result.message;
    const assistantMsg: AiChatMessage = {
      id: `a-${++idRef.current}`,
      role: "assistant",
      content: replyText,
      createdAt: SEED_CHAT_TIME,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setPending(false);
  };

  return (
    <Stack gap="md" className={styles.page}>
      <PageHeader title="CapraCare AI" description="Trợ lý tư vấn chăn nuôi dê" />
      <Group gap="xs" className={styles.prompts}>
        {suggestedPrompts.map((sp) => (
          <Button key={sp.id} variant="light" size="xs" onClick={() => void sendMessage(sp.prompt)}>
            {sp.label}
          </Button>
        ))}
      </Group>
      <Paper withBorder radius="md" className={styles.chatBox}>
        <ScrollArea className={styles.scroll} p="md" type="auto">
          <Stack gap="sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.role === "user" ? styles.userBubble : styles.botBubble}
              >
                <Text size="sm">{msg.content}</Text>
                <Text size="xs" c="dimmed" mt={4}>
                  {formatTimeVi(msg.createdAt)}
                </Text>
              </div>
            ))}
            {pending ? (
              <Text size="sm" c="dimmed" className={styles.botBubble}>
                Đang soạn trả lời...
              </Text>
            ) : null}
          </Stack>
        </ScrollArea>
        <Group p="md" align="flex-end" className={styles.inputRow}>
          <Textarea
            placeholder="Nhập câu hỏi..."
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            autosize
            minRows={1}
            maxRows={4}
            flex={1}
            disabled={pending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
          />
          <Button
            leftSection={<IconSend size={16} />}
            onClick={() => void sendMessage(input)}
            loading={pending}
            disabled={pending}
          >
            Gửi
          </Button>
        </Group>
      </Paper>
      <Text size="xs" c="dimmed" className={styles.disclaimer}>
        AI chỉ cung cấp thông tin tham khảo. Trường hợp nghiêm trọng, vui lòng liên hệ bác sĩ thú y.
      </Text>
    </Stack>
  );
}
