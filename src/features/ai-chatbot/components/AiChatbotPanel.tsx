"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Drawer,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertCircle, IconHistory, IconMessagePlus, IconSend, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { formatTimeVi } from "@/shared/utils/format";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { deleteChatConversation, fetchChatConversations, fetchChatMessages } from "../lib/chat-api-client";
import type { ChatConversation, ChatMessage, ChatSourceRef, ChatSuggestedPrompt } from "../types/chatbot.types";
import styles from "./AiChatbotPanel.module.css";

type AiChatbotPanelProps = {
  suggestedPrompts: ChatSuggestedPrompt[];
  isGuest: boolean;
  initialConversations: ChatConversation[];
  aiApiConfigured?: boolean;
  initialQuery?: string;
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

export function AiChatbotPanel({
  suggestedPrompts,
  isGuest,
  initialConversations,
  aiApiConfigured = true,
  initialQuery = "",
}: AiChatbotPanelProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialQuery);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const localMsgRef = useRef(0);
  const mountedRef = useRef(true);
  const [historyOpened, { open: openHistory, close: closeHistory }] = useDisclosure(false);
  const [deleteTarget, setDeleteTarget] = useState<ChatConversation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const showSuggestedPrompts = messages.length === 0 && !pending;

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
    closeHistory();
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
    closeHistory();
  };

  const requestDeleteConversation = (conversation: ChatConversation, event: MouseEvent) => {
    event.stopPropagation();
    setDeleteTarget(conversation);
  };

  const confirmDeleteConversation = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const result = await deleteChatConversation(deleteTarget.id);
      if (!mountedRef.current) return;
      if (!result.ok) {
        setError(result.message ?? "Không xóa được cuộc trò chuyện");
        return;
      }
      setConversations((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      if (activeId === deleteTarget.id) {
        startNewConversation();
      }
      setDeleteTarget(null);
    } finally {
      if (mountedRef.current) {
        setDeleting(false);
      }
    }
  };

  const conversationList = (
    <Stack gap={4}>
      {conversations.length === 0 ? (
        <Text size="xs" c="dimmed">
          Chưa có cuộc trò chuyện
        </Text>
      ) : (
        conversations.map((c) => (
          <div
            key={c.id}
            className={`${styles.conversationItem} ${c.id === activeId ? styles.conversationItemActive : ""}`}
          >
            <UnstyledButton className={styles.conversationMain} onClick={() => void selectConversation(c.id)} p="xs">
              <Text size="sm" lineClamp={2}>
                {c.title}
              </Text>
              <Text size="xs" c="dimmed">
                {formatTimeVi(c.updatedAt)}
              </Text>
            </UnstyledButton>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              className={styles.conversationDelete}
              aria-label={`Xóa cuộc trò chuyện ${c.title}`}
              onClick={(event) => requestDeleteConversation(c, event)}
              disabled={pending || deleting}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </div>
        ))
      )}
    </Stack>
  );

  const sendMessage = async (text: string, retry = false) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

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
      const historyForApi = isGuest
        ? messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content }))
        : undefined;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          message: trimmed,
          ...(isGuest || !activeId ? {} : { conversationId: activeId }),
          ...(historyForApi?.length ? { history: historyForApi } : {}),
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
      const convId = isGuest ? (activeId ?? `guest-session-${++localMsgRef.current}`) : data.conversationId;
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

      if (!isGuest) {
        void refreshConversations();
      }
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

  const guestDescription =
    "Chế độ khách — hỏi AI ngay, lịch sử chỉ trong phiên này (không lưu khi thoát trang).";

  return (
    <Stack gap="md" className={styles.page}>
      <div className={styles.pageTop}>
        <Group justify="space-between" align="center" wrap="nowrap" className={`${styles.topRow} ${styles.mobileTopRow}`}>
          <div>
            <Text className={styles.pageTitle}>CapraCare AI</Text>
          </div>
          <Group gap={6} className={styles.mobileOnly}>
            <ActionIcon variant="light" color="capraBlue" size="lg" aria-label="Cuộc trò chuyện mới" onClick={startNewConversation}>
              <IconMessagePlus size={18} />
            </ActionIcon>
            {!isGuest ? (
              <ActionIcon
                variant="light"
                color="gray"
                size="lg"
                aria-label="Lịch sử hội thoại"
                onClick={openHistory}
              >
                <IconHistory size={18} />
              </ActionIcon>
            ) : null}
          </Group>
        </Group>
        <div className={styles.desktopHeader}>
          <PageHeader
            title="CapraCare AI"
            description={isGuest ? guestDescription : "Trợ lý tư vấn chăn nuôi dê"}
          />
        </div>
        {isGuest ? (
          <Alert color="blue" variant="light" className={styles.guestBanner}>
            {guestDescription}{" "}
            <Text component={Link} href="/login" span c="capraBlue" fw={600}>
              Đăng nhập
            </Text>{" "}
            để lưu lịch sử hội thoại.
          </Alert>
        ) : null}
        {!aiApiConfigured ? (
          <Alert color="yellow" variant="light" className={styles.guestBanner}>
            Chế độ trả lời cơ bản (chưa cấu hình LLM). Thêm{" "}
            <Text span fw={600}>
              GROQ_API_KEY
            </Text>{" "}
            miễn phí vào <Text span fw={600}>.env.local</Text> (đăng ký tại console.groq.com) hoặc
            cài Ollama local, rồi restart dev server.
          </Alert>
        ) : null}
        {showSuggestedPrompts ? (
          <div className={styles.promptsWrap}>
            <div className={`${styles.promptsScroll} ${styles.promptsDesktop}`}>
              {suggestedPrompts.map((sp) => (
                <Button
                  key={sp.id}
                  className={styles.promptChip}
                  variant="light"
                  size="xs"
                  onClick={() => void sendMessage(sp.prompt)}
                  disabled={pending}
                >
                  {sp.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {!isGuest ? (
        <Drawer
          opened={historyOpened}
          onClose={closeHistory}
          title={<span className={styles.historyDrawerTitle}>Lịch sử hội thoại</span>}
          position="bottom"
          size="55%"
          classNames={{ body: styles.drawerList }}
        >
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
          <ScrollArea h="calc(55dvh - 5rem)" type="scroll" offsetScrollbars>
            {conversationList}
          </ScrollArea>
        </Drawer>
      ) : null}

      {!isGuest ? (
        <ConfirmDialog
          opened={deleteTarget !== null}
          title="Xóa cuộc trò chuyện"
          message={
            deleteTarget
              ? `Bạn có chắc muốn xóa "${deleteTarget.title}"? Toàn bộ tin nhắn sẽ bị xóa vĩnh viễn.`
              : ""
          }
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          destructive
          loading={deleting}
          onConfirm={() => void confirmDeleteConversation()}
          onCancel={() => {
            if (!deleting) setDeleteTarget(null);
          }}
        />
      ) : null}

      <div className={styles.chatShell}>
        <div className={styles.layout}>
          {!isGuest ? (
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
                {conversationList}
              </ScrollArea>
            </Paper>
          ) : null}

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
                      {isGuest
                        ? "Hãy đặt câu hỏi về chăn nuôi dê. Lịch sử sẽ mất khi bạn đóng tab hoặc thoát trang."
                        : "Hãy đặt câu hỏi về chăn nuôi, môi trường chuồng hoặc sức khỏe đàn dê."}
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
              <Group align="flex-end" wrap="nowrap" className={styles.inputRow}>
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
                  className={styles.sendBtnDesktop}
                  leftSection={<IconSend size={16} />}
                  onClick={() => void sendMessage(input)}
                  loading={pending}
                  disabled={pending}
                >
                  Gửi
                </Button>
                <ActionIcon
                  className={styles.sendBtnMobile}
                  size="input-lg"
                  variant="filled"
                  color="capraBlue"
                  aria-label="Gửi"
                  onClick={() => void sendMessage(input)}
                  loading={pending}
                  disabled={pending}
                >
                  <IconSend size={18} />
                </ActionIcon>
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
