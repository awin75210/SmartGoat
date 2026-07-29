"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Group, Select, Stack, Text, TextInput } from "@mantine/core";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { formatDateVi } from "@/shared/utils/format";
import {
  HANDBOOK_CATEGORY_LABELS,
  type HandbookArticle,
  type HandbookCategory,
} from "../types/handbook.types";
import styles from "./HandbookPage.module.css";

type HandbookPageProps = {
  articles: HandbookArticle[];
};

export function HandbookPage({ articles }: HandbookPageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<HandbookCategory | "all">("all");

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [articles, search, category]);

  return (
    <Stack gap="lg" className={styles.page}>
      <PageHeader
        title="Sổ tay chăn nuôi"
        description="Kỹ thuật chăn nuôi, dinh dưỡng, tra cứu bệnh thường gặp và chăm dê con theo từng giai đoạn — lọc theo danh mục bên dưới."
      />
      <Group grow preventGrowOverflow={false}>
        <TextInput
          placeholder="Tìm bài viết..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <Select
          label="Danh mục"
          data={[
            { value: "all", label: "Tất cả" },
            ...Object.entries(HANDBOOK_CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
          value={category}
          onChange={(v) => setCategory((v as HandbookCategory | "all") ?? "all")}
        />
      </Group>
      <Stack gap="sm">
        {filtered.map((article) => (
          <Link key={article.id} href={`/app/handbook/${article.id}`} className={styles.card}>
            <Group justify="space-between" mb={4}>
              <Text fw={700}>{article.title}</Text>
              <Badge variant="light">{HANDBOOK_CATEGORY_LABELS[article.category]}</Badge>
            </Group>
            <Text size="sm" c="dimmed" lineClamp={2}>
              {article.summary}
            </Text>
            <Text size="xs" c="dimmed" mt={6}>
              Cập nhật {formatDateVi(article.updatedAt)}
            </Text>
          </Link>
        ))}
      </Stack>
    </Stack>
  );
}
