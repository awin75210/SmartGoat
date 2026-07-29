"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from "@mantine/core";
import { IconAlertCircle, IconMessagePlus, IconSend } from "@tabler/icons-react";
import Link from "next/link";
import { formatTimeVi } from "@/shared/utils/format";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { fetchChatConversations, fetchChatMessages } from "../lib/chat-api-client";
import type { ChatConversation, ChatMessage, ChatSourceRef, ChatSuggestedPrompt } from "../types/chatbot.types";
import styles from "./AiChatbotPanel.module.css";

type AiChatbotPanelProps = {
  suggestedPrompts: ChatSuggestedPrompt[];
  isGuest: boolean;
  initialConversations: ChatConversation[];
};

type ChatApiSuccess = {
  ok: true;
  data: {
    conversationId: string;
    message: ChatMessage;
    sources: ChatSourceRef[];
  };
};

type ChatApiFailure = {
  ok: false;
  message?: string;
  code?: string;
};

export function AiChatbotPanel({ suggestedPrompts, isGuest, initialConversations }: AiChatbotPanelProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const localMsgRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshConversations = useCallback(async () => {
    if (isGuest) return;
    const result = await fetchChatConversations();
    if (result.ok && mountedRef.current) {
      setConversations(result.data);
    }
  }, [isGuest]);

  const selectConversation = async (id: string) => {
    setActiveId(id);
    setError(null);
    setPending(true);
    try {
      const result = await fetchChatMessages(id);
      if (!mountedRef.current) return;
      if (result.ok) {
        setMessages(result.data);
      } else {
        setError(result.message ?? "Không tải được tin nhắn");
      }
    } finally {
      if (mountedRef.current) {
        setPending(false);
      }
    }
  };

  const startNewConversation = () => {
    setError(null);
    setActiveId(null);
    setMessages([]);
  };

  const sendMessage = async (text: string, retry = false) => {
    const trimmed = text.trim();
    if (!trimmed || pending || isGuest) return;

    if (!retry) {
      const userMsg: ChatMessage = {
        id: `local-u-${++localMsgRef.current}`,
        conversationId: activeId ?? "",
        role: "user",
        content: trimmed,
        sources: [],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
    }

    setPending(true);
    setError(null);
    setLastFailedText(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          message: trimmed,
          conversationId: activeId ?? undefined,
        }),
      });

      let json: ChatApiSuccess | ChatApiFailure;
      try {
        json = (await res.json()) as ChatApiSuccess | ChatApiFailure;
      } catch {
        if (!mountedRef.current) return;
        const contentType = res.headers.get("content-type") ?? "";
        setError(
          contentType.includes("text/html")
            ? "Phiên đăng nhập hoặc quyền truy cập API không hợp lệ. Thử đăng xuất và đăng nhập lại."
            : `Máy chủ trả lời không hợp lệ (HTTP ${res.status}). Kiểm tra terminal dev server hoặc migration Supabase (bảng chat_*, knowledge_*).`,
        );
        setLastFailedText(trimmed);
        return;
      }

      if (!res.ok || !json.ok) {
        const message =
          (json as ChatApiFailure).message ??
          (res.status === 429 ? "Bạn gửi quá nhanh. Vui lòng đợi vài giây." : "Không gửi được câu hỏi.");
        if (!mountedRef.current) return;
        setError(message);
        setLastFailedText(trimmed);
        if (!retry) {
          setMessages((prev) => prev.filter((m) => !m.id.startsWith("local-u-") || m.content !== trimmed));
        }
        return;
      }

      const data = (json as ChatApiSuccess).data;
      const convId = data.conversationId;
      if (!mountedRef.current) return;
      if (!activeId) {
        setActiveId(convId);
      }

      setMessages((prev) => {
        const userFromLocal = prev.find(
          (m) => m.id.startsWith("local-u-") && m.role === "user" && m.content === trimmed,
        );
        const userMsg: ChatMessage = userFromLocal
          ? { ...userFromLocal, conversationId: convId }
          : {
              id: `local-u-${++localMsgRef.current}`,
              conversationId: convId,
              role: "user",
              content: trimmed,
              sources: [],
              createdAt: new Date().toISOString(),
            };
        const assistant: ChatMessage = {
          ...data.message,
          conversationId: convId,
          sources: data.message.sources?.length ? data.message.sources : data.sources,
        };
        const rest = prev.filter((m) => !m.id.startsWith("local-u-") && m.id !== assistant.id);
        const hasUser = rest.some((m) => m.role === "user" && m.content === trimmed);
        return hasUser ? [...rest, assistant] : [...rest, userMsg, assistant];
      });

      void refreshConversations();
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("[ai-chat] client send failed", err);
      setError("Lỗi kết nối. Vui lòng thử lại.");
      setLastFailedText(trimmed);
    } finally {
      if (mountedRef.current) {
        setPending(false);
      }
    }
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, pending]);

  if (isGuest) {
    return (
      <Stack gap="md" className={styles.page}>
        <PageHeader title="CapraCare AI" description="Trợ lý tư vấn chăn nuôi dê" />
        <Alert color="blue" title="Đăng nhập để dùng trợ lý AI">
          Lịch sử hội thoại và câu trả lời cá nhân hóa theo trang trại chỉ khả dụng sau khi đăng nhập.{" "}
          <Text component={Link} href="/login" span c="teal" fw={600}>
            Đăng nhập
          </Text>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="md" className={styles.page}>
      <div className={styles.pageTop}>
        <PageHeader title="CapraCare AI" description="Trợ lý tư vấn chăn nuôi dê" />
        <Group gap="xs" className={styles.prompts} mt="sm">
          {suggestedPrompts.map((sp) => (
            <Button key={sp.id} variant="light" size="xs" onClick={() => void sendMessage(sp.prompt)} disabled={pending}>
              {sp.label}
            </Button>
          ))}
        </Group>
      </div>

      <div className={styles.chatShell}>
        <div className={styles.layout}>
          <Paper className={styles.sidebar} p="sm" radius="md">
            <Button
              fullWidth
              leftSection={<IconMessagePlus size={16} />}
              variant="light"
              size="xs"
              mb="sm"
              onClick={startNewConversation}
            >
              Cuộc trò chuyện mới
            </Button>
            <ScrollArea className={styles.sidebarScroll} type="scroll" offsetScrollbars scrollbars="y">
              <Stack gap={4}>
                {conversations.length === 0 ? (
                  <Text size="xs" c="dimmed">
                    Chưa có cuộc trò chuyện
                  </Text>
                ) : (
                  conversations.map((c) => (
                    <UnstyledButton
                      key={c.id}
                      className={`${styles.conversationItem} ${c.id === activeId ? styles.conversationItemActive : ""}`}
                      onClick={() => void selectConversation(c.id)}
                      p="xs"
                    >
                      <Text size="sm" lineClamp={2}>
                        {c.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatTimeVi(c.updatedAt)}
                      </Text>
                    </UnstyledButton>
                  ))
                )}
              </Stack>
            </ScrollArea>
          </Paper>

          <div className={styles.main}>
            {error ? (
              <Alert
                className={styles.errorBanner}
                color="red"
                icon={<IconAlertCircle size={16} />}
                mb="sm"
                withCloseButton
                onClose={() => setError(null)}
              >
                {error}
                {lastFailedText ? (
                  <Button size="xs" variant="white" mt="xs" onClick={() => void sendMessage(lastFailedText, true)}>
                    Thử lại
                  </Button>
                ) : null}
              </Alert>
            ) : null}

            <Paper className={styles.chatBox} radius="md">
              <ScrollArea className={styles.messagesScroll} type="scroll" offsetScrollbars scrollbars="y" p="md">
                <Stack gap="sm" className={styles.messageList}>
                  {messages.length === 0 && !pending ? (
                    <Text size="sm" c="dimmed">
                      Hãy đặt câu hỏi về chăn nuôi, môi trường chuồng hoặc sức khỏe đàn dê.
                    </Text>
                  ) : null}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={msg.role === "user" ? styles.userBubble : styles.botBubble}
                    >
                      <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </Text>
                      {msg.role === "assistant" && msg.sources.length > 0 ? (
                        <Stack gap={2} className={styles.sources}>
                          <Text size="xs" c="dimmed" fw={600}>
                            Nguồn tham khảo:
                          </Text>
                          {msg.sources.map((s) => (
                            <Text key={`${s.type}-${s.id}`} size="xs" c="dimmed">
                              • {s.type === "faq" ? "FAQ" : "Bài viết"}: {s.title}
                            </Text>
                          ))}
                        </Stack>
                      ) : null}
                      <Text size="xs" c="dimmed" mt={4}>
                        {formatTimeVi(msg.createdAt)}
                      </Text>
                    </div>
                  ))}
                  {pending ? (
                    <Text size="sm" c="dimmed" className={styles.botBubble}>
                      AI đang trả lời...
                    </Text>
                  ) : null}
                  <div ref={scrollRef} />
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
          </div>
        </div>
      </div>

      <Text size="xs" c="dimmed" className={styles.disclaimer}>
        AI chỉ cung cấp thông tin tham khảo. Trường hợp nghiêm trọng, vui lòng liên hệ bác sĩ thú y.
      </Text>
    </Stack>
  );
}
