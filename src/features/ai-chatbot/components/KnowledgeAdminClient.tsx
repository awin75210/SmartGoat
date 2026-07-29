"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  FileInput,
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
import { IconDownload, IconUpload } from "@tabler/icons-react";
import {
  listKnowledgeArticlesAdminAction,
  listKnowledgeFaqsAdminAction,
  saveKnowledgeArticleAdminAction,
  saveKnowledgeFaqAdminAction,
  setKnowledgeArticleStatusAction,
} from "@/features/ai-chatbot/actions/chatbot.actions";
import { importKnowledgeXlsxAction } from "@/features/ai-chatbot/actions/knowledge-import.actions";
import {
  getKnowledgeCategorySelectOptions,
  normalizeKnowledgeCategory,
  type KnowledgeCategorySlug,
} from "@/features/ai-chatbot/constants/knowledge-categories";
import type { KnowledgeImportResult } from "@/features/ai-chatbot/schemas/knowledge-import.schema";
import type { KnowledgeArticle, KnowledgeFaq, KnowledgeStatus } from "@/features/ai-chatbot/types/chatbot.types";

const STATUS_OPTIONS = [
  { value: "draft", label: "Nháp" },
  { value: "published", label: "Xuất bản" },
  { value: "hidden", label: "Ẩn" },
];

type ArticleFormState = {
  id: string | null;
  title: string;
  summary: string;
  category: KnowledgeCategorySlug;
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
  const [articles, setArticles] = useState(initialArticles);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [articleForm, setArticleForm] = useState<ArticleFormState>({
    id: null,
    title: "",
    summary: "",
    category: "farming_technique",
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
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPending, setImportPending] = useState(false);
  const [importResult, setImportResult] = useState<KnowledgeImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const reloadFromServer = async () => {
    const [articlesResult, faqsResult] = await Promise.all([
      listKnowledgeArticlesAdminAction(),
      listKnowledgeFaqsAdminAction(),
    ]);
    if (articlesResult.ok) setArticles(articlesResult.data);
    if (faqsResult.ok) setFaqs(faqsResult.data);
  };

  const handleDownloadTemplate = () => {
    window.location.href = "/api/admin/knowledge/template";
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportError("Vui lòng chọn file .xlsx");
      return;
    }
    setImportPending(true);
    setImportError(null);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.set("file", importFile);
      const result = await importKnowledgeXlsxAction(formData);
      if (!result.ok) {
        setImportError(result.message);
        return;
      }
      setImportResult(result.data);
      setImportFile(null);
      await reloadFromServer();
    } finally {
      setImportPending(false);
    }
  };

  const saveArticle = async () => {
    const result = await saveKnowledgeArticleAdminAction(articleForm.id, {
      title: articleForm.title,
      summary: articleForm.summary,
      category: articleForm.category,
      keywords: articleForm.keywords,
      content: articleForm.content,
      status: articleForm.status,
    });
    if (result.ok) {
      setArticleForm({
        id: null,
        title: "",
        summary: "",
        category: "farming_technique",
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
    }
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Kiến thức AI Chatbot</Title>
      <Text size="sm" c="dimmed">
        Bài viết trạng thái published hiển thị trên Sổ tay điện tử và dùng cho trợ lý AI. FAQ chỉ dùng cho
        chat.
      </Text>

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="xs">
          Nhập hàng loạt (Excel)
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          File .xlsx gồm sheet Articles và FAQs. Cột category: farming_technique, nutrition, common_diseases hoặc kid_care_stages (slug cũ như health vẫn được chuẩn hóa khi import). Trùng tiêu đề / câu hỏi sẽ được cập nhật.
        </Text>
        <Stack gap="sm">
          <Group align="flex-end">
            <Button
              variant="light"
              leftSection={<IconDownload size={16} />}
              onClick={handleDownloadTemplate}
            >
              Tải file mẫu Excel
            </Button>
            <FileInput
              label="Chọn file .xlsx"
              placeholder="capracare-knowledge-template.xlsx"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              value={importFile}
              onChange={setImportFile}
              flex={1}
              clearable
            />
            <Button
              leftSection={<IconUpload size={16} />}
              loading={importPending}
              onClick={() => void handleImport()}
              disabled={!importFile}
            >
              Import
            </Button>
          </Group>
          {importError ? (
            <Alert color="red" title="Import thất bại">
              {importError}
            </Alert>
          ) : null}
          {importResult ? (
            <Alert color="green" title="Kết quả import">
              <Text size="sm">
                Bài viết: {importResult.articlesCreated} mới, {importResult.articlesUpdated} cập nhật. FAQ:{" "}
                {importResult.faqsCreated} mới, {importResult.faqsUpdated} cập nhật.
              </Text>
              {importResult.errors.length > 0 ? (
                <Stack gap={4} mt="xs">
                  <Text size="sm" fw={600}>
                    Lỗi ({importResult.errors.length}):
                  </Text>
                  {importResult.errors.slice(0, 15).map((err, i) => (
                    <Text key={`${err.sheet}-${err.row}-${i}`} size="xs">
                      [{err.sheet} dòng {err.row || "—"}] {err.message}
                    </Text>
                  ))}
                  {importResult.errors.length > 15 ? (
                    <Text size="xs" c="dimmed">
                      … và {importResult.errors.length - 15} lỗi khác
                    </Text>
                  ) : null}
                </Stack>
              ) : null}
            </Alert>
          ) : null}
        </Stack>
      </Paper>

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
            label="Tóm tắt (sổ tay điện tử)"
            value={articleForm.summary}
            onChange={(e) => setArticleForm((f) => ({ ...f, summary: e.currentTarget.value }))}
          />
          <Select
            label="Danh mục"
            description="farming_technique | nutrition | common_diseases | kid_care_stages"
            data={getKnowledgeCategorySelectOptions()}
            value={articleForm.category}
            onChange={(v) =>
              setArticleForm((f) => ({
                ...f,
                category: (v as KnowledgeCategorySlug) ?? "farming_technique",
              }))
            }
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
                          summary: a.summary,
                          category: normalizeKnowledgeCategory(a.category),
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
