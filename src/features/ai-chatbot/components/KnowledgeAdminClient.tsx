"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  saveKnowledgeArticleAdminAction,
  saveKnowledgeFaqAdminAction,
  setKnowledgeArticleStatusAction,
} from "@/features/ai-chatbot/actions/chatbot.actions";
import type { KnowledgeArticle, KnowledgeFaq, KnowledgeStatus } from "@/features/ai-chatbot/types/chatbot.types";

const STATUS_OPTIONS = [
  { value: "draft", label: "Nháp" },
  { value: "published", label: "Xuất bản" },
  { value: "hidden", label: "Ẩn" },
];

type ArticleFormState = {
  id: string | null;
  title: string;
  category: string;
  keywords: string;
  content: string;
  status: KnowledgeStatus;
};

type FaqFormState = {
  id: string | null;
  question: string;
  answer: string;
  keywords: string;
  priority: string;
  status: KnowledgeStatus;
};

type KnowledgeAdminClientProps = {
  initialArticles: KnowledgeArticle[];
  initialFaqs: KnowledgeFaq[];
};

export function KnowledgeAdminClient({ initialArticles, initialFaqs }: KnowledgeAdminClientProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [articleForm, setArticleForm] = useState<ArticleFormState>({
    id: null,
    title: "",
    category: "health",
    keywords: "",
    content: "",
    status: "draft",
  });
  const [faqForm, setFaqForm] = useState<FaqFormState>({
    id: null,
    question: "",
    answer: "",
    keywords: "",
    priority: "0",
    status: "draft",
  });

  const refreshFromServer = () => {
    router.refresh();
  };

  const saveArticle = async () => {
    const result = await saveKnowledgeArticleAdminAction(articleForm.id, {
      title: articleForm.title,
      category: articleForm.category,
      keywords: articleForm.keywords,
      content: articleForm.content,
      status: articleForm.status,
    });
    if (result.ok) {
      setArticleForm({
        id: null,
        title: "",
        category: "health",
        keywords: "",
        content: "",
        status: "draft",
      });
      setArticles((prev) => {
        const idx = prev.findIndex((a) => a.id === result.data.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = result.data;
          return next;
        }
        return [result.data, ...prev];
      });
      refreshFromServer();
    }
  };

  const saveFaq = async () => {
    const result = await saveKnowledgeFaqAdminAction(faqForm.id, {
      question: faqForm.question,
      answer: faqForm.answer,
      keywords: faqForm.keywords,
      priority: Number(faqForm.priority) || 0,
      status: faqForm.status,
    });
    if (result.ok) {
      setFaqForm({
        id: null,
        question: "",
        answer: "",
        keywords: "",
        priority: "0",
        status: "draft",
      });
      setFaqs((prev) => {
        const idx = prev.findIndex((f) => f.id === result.data.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = result.data;
          return next;
        }
        return [result.data, ...prev];
      });
      refreshFromServer();
    }
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Kiến thức AI Chatbot</Title>
      <Text size="sm" c="dimmed">
        Quản lý bài viết và FAQ dùng cho trợ lý AI. Bài đang được trích dẫn trong hội thoại chỉ nên ẩn, không xóa cứng.
      </Text>

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="sm">
          Bài viết
        </Title>
        <Stack gap="sm" mb="md">
          <TextInput
            label="Tiêu đề"
            value={articleForm.title}
            onChange={(e) => setArticleForm((f) => ({ ...f, title: e.currentTarget.value }))}
          />
          <TextInput
            label="Danh mục"
            value={articleForm.category}
            onChange={(e) => setArticleForm((f) => ({ ...f, category: e.currentTarget.value }))}
          />
          <TextInput
            label="Từ khóa (phẩy)"
            value={articleForm.keywords}
            onChange={(e) => setArticleForm((f) => ({ ...f, keywords: e.currentTarget.value }))}
          />
          <Textarea
            label="Nội dung"
            minRows={4}
            value={articleForm.content}
            onChange={(e) => setArticleForm((f) => ({ ...f, content: e.currentTarget.value }))}
          />
          <Select
            label="Trạng thái"
            data={STATUS_OPTIONS}
            value={articleForm.status}
            onChange={(v) =>
              setArticleForm((f) => ({
                ...f,
                status: (v as KnowledgeStatus) ?? "draft",
              }))
            }
          />
          <Button onClick={() => void saveArticle()}>{articleForm.id ? "Cập nhật" : "Thêm bài viết"}</Button>
        </Stack>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tiêu đề</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {articles.map((a) => (
              <Table.Tr key={a.id}>
                <Table.Td>{a.title}</Table.Td>
                <Table.Td>
                  <Badge size="sm">{a.status}</Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() =>
                        setArticleForm({
                          id: a.id,
                          title: a.title,
                          category: a.category,
                          keywords: a.keywords.join(", "),
                          content: a.content,
                          status: a.status,
                        })
                      }
                    >
                      Sửa
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() =>
                        void setKnowledgeArticleStatusAction(a.id, "hidden").then((r) => {
                          if (r.ok) {
                            setArticles((prev) =>
                              prev.map((row) => (row.id === a.id ? { ...row, status: "hidden" } : row)),
                            );
                          }
                        })
                      }
                    >
                      Ẩn
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="sm">
          FAQ
        </Title>
        <Stack gap="sm" mb="md">
          <TextInput
            label="Câu hỏi"
            value={faqForm.question}
            onChange={(e) => setFaqForm((f) => ({ ...f, question: e.currentTarget.value }))}
          />
          <Textarea
            label="Gợi ý trả lời (AI diễn đạt lại, không copy nguyên văn)"
            minRows={3}
            value={faqForm.answer}
            onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.currentTarget.value }))}
          />
          <TextInput
            label="Từ khóa"
            value={faqForm.keywords}
            onChange={(e) => setFaqForm((f) => ({ ...f, keywords: e.currentTarget.value }))}
          />
          <TextInput
            label="Ưu tiên"
            value={faqForm.priority}
            onChange={(e) => setFaqForm((f) => ({ ...f, priority: e.currentTarget.value }))}
          />
          <Select
            label="Trạng thái"
            data={STATUS_OPTIONS}
            value={faqForm.status}
            onChange={(v) =>
              setFaqForm((f) => ({
                ...f,
                status: (v as KnowledgeStatus) ?? "draft",
              }))
            }
          />
          <Button onClick={() => void saveFaq()}>{faqForm.id ? "Cập nhật FAQ" : "Thêm FAQ"}</Button>
        </Stack>
        <Stack gap="xs">
          {faqs.map((f) => (
            <Group key={f.id} justify="space-between">
              <Text size="sm">{f.question}</Text>
              <Group gap="xs">
                <Badge size="xs">{f.status}</Badge>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() =>
                    setFaqForm({
                      id: f.id,
                      question: f.question,
                      answer: f.answer,
                      keywords: f.keywords.join(", "),
                      priority: String(f.priority),
                      status: f.status,
                    })
                  }
                >
                  Sửa
                </Button>
              </Group>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
