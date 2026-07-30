"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import {
  Badge,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBabyCarriage,
  IconHeart,
  IconLeaf,
  IconMessageChatbot,
  IconPlant2,
  IconSearch,
  IconStethoscope,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { formatDateVi } from "@/shared/utils/format";
import {
  HANDBOOK_CATEGORIES,
  HANDBOOK_CATEGORY_META,
  type HandbookArticle,
  type HandbookCategory,
} from "../types/handbook.types";
import { HandbookFavoriteButton } from "./HandbookFavoriteButton";
import { HandbookSearchAiModal } from "./HandbookSearchAiModal";
import {
  articleMatchesSearch,
  filterHandbookArticles,
} from "../utils/handbook-search.utils";
import styles from "./HandbookPage.module.css";

type HandbookPageProps = {
  articles: HandbookArticle[];
  favoriteIds: string[];
  isGuest: boolean;
};

type ListFilter = HandbookCategory | "all" | "favorites";

const CATEGORY_ICONS: Record<HandbookCategory, TablerIcon> = {
  farming_technique: IconPlant2,
  nutrition: IconLeaf,
  common_diseases: IconStethoscope,
  kid_care_stages: IconBabyCarriage,
};

export function HandbookPage({ articles, favoriteIds, isGuest }: HandbookPageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ListFilter>("all");
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(favoriteIds));
  const [dismissedSearchQuery, setDismissedSearchQuery] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const searchQuery = search.trim();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    return filterHandbookArticles(articles, {
      search,
      category,
      favoriteIds: favorites,
    });
  }, [articles, search, category, favorites]);

  const hasGlobalSearchMatch = useMemo(() => {
    if (!debouncedSearchQuery) return false;
    return articles.some((article) => articleMatchesSearch(article, debouncedSearchQuery));
  }, [articles, debouncedSearchQuery]);

  const isSearchWithNoResults =
    debouncedSearchQuery.length >= 2 &&
    !hasGlobalSearchMatch &&
    category !== "favorites";
  const showAiModal = isSearchWithNoResults && dismissedSearchQuery !== debouncedSearchQuery;

  const isCategoryFilteredEmpty =
    searchQuery.length > 0 &&
    filtered.length === 0 &&
    hasGlobalSearchMatch &&
    category !== "all" &&
    category !== "favorites";

  useEffect(() => {
    if (!searchQuery) {
      setDismissedSearchQuery(null);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (hasGlobalSearchMatch) {
      setDismissedSearchQuery(null);
    }
  }, [hasGlobalSearchMatch]);

  const handleFavoriteToggle = (articleId: string, favorited: boolean) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (favorited) next.add(articleId);
      else next.delete(articleId);
      return next;
    });
  };

  const emptyDescription =
    category === "favorites"
      ? isGuest
        ? "Đăng nhập để lưu bài yêu thích và đọc lại sau."
        : "Bấm biểu tượng trái tim trên bài viết để lưu yêu thích."
      : isCategoryFilteredEmpty
        ? "Có bài phù hợp ở danh mục khác — chọn 「Tất cả」 hoặc đổi bộ lọc."
        : searchQuery
          ? "Thử từ khóa khác hoặc hỏi CapraCare AI để được tư vấn thêm."
          : "Thử đổi từ khóa hoặc chọn danh mục khác.";

  return (
    <Stack gap="lg" className={styles.page}>
      <HandbookSearchAiModal
        opened={showAiModal}
        searchQuery={debouncedSearchQuery}
        onClose={() => setDismissedSearchQuery(debouncedSearchQuery)}
      />
      <PageHeader
        title="Sổ tay chăn nuôi"
        description={
          isGuest
            ? "Kỹ thuật, dinh dưỡng, bệnh thường gặp và chăm dê con. Đăng nhập để lưu bài yêu thích."
            : "Kỹ thuật, dinh dưỡng, bệnh thường gặp và chăm dê con — lọc nhanh hoặc xem mục yêu thích."
        }
      />

      <div className={styles.filterBar}>
        <TextInput
          placeholder="Tìm bài viết, từ khóa..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          leftSection={<IconSearch size={16} stroke={1.5} />}
          className={styles.searchInput}
        />
        <div className={styles.categoryChips}>
          <Button
            variant={category === "all" ? "filled" : "light"}
            color="capraBlue"
            size="xs"
            radius="xl"
            className={styles.chip}
            onClick={() => setCategory("all")}
          >
            Tất cả
          </Button>
          {!isGuest ? (
            <Button
              variant={category === "favorites" ? "filled" : "light"}
              color="red"
              size="xs"
              radius="xl"
              className={styles.chip}
              leftSection={<IconHeart size={14} stroke={1.5} />}
              onClick={() => setCategory("favorites")}
            >
              Yêu thích{favorites.size > 0 ? ` (${favorites.size})` : ""}
            </Button>
          ) : null}
          {HANDBOOK_CATEGORIES.map((cat) => {
            const meta = HANDBOOK_CATEGORY_META[cat];
            const Icon = CATEGORY_ICONS[cat];
            return (
              <Button
                key={cat}
                variant={category === cat ? "filled" : "light"}
                color={meta.color}
                size="xs"
                radius="xl"
                className={styles.chip}
                leftSection={<Icon size={14} stroke={1.5} />}
                onClick={() => setCategory(cat)}
              >
                {meta.label}
              </Button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={category === "favorites" ? "Chưa có bài yêu thích" : "Không tìm thấy bài viết"}
          description={emptyDescription}
          action={
            isSearchWithNoResults ? (
              <Button
                component={Link}
                href={`/app/ai-assistant?q=${encodeURIComponent(debouncedSearchQuery)}`}
                color="capraBlue"
                leftSection={<IconMessageChatbot size={16} stroke={1.5} />}
              >
                Hỏi trợ lý AI
              </Button>
            ) : undefined
          }
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" className={styles.articleGrid}>
          {filtered.map((article) => {
            const meta = HANDBOOK_CATEGORY_META[article.category];
            const Icon = CATEGORY_ICONS[article.category];
            const isFavorited = favorites.has(article.id);

            return (
              <div
                key={article.id}
                className={styles.articleCardWrap}
                style={{ "--category-accent": meta.accent } as CSSProperties}
              >
                <Link href={`/app/handbook/${article.id}`} className={styles.articleCard}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                    <ThemeIcon size="md" radius="md" variant="light" color={meta.color}>
                      <Icon size={18} stroke={1.5} />
                    </ThemeIcon>
                    <Badge variant="light" color={meta.color} size="sm">
                      {meta.label}
                    </Badge>
                  </Group>
                  <Text fw={700} className={styles.cardTitle} lineClamp={2}>
                    {article.title}
                  </Text>
                  <Text size="sm" c="dimmed" lineClamp={2} className={styles.cardSummary}>
                    {article.summary}
                  </Text>
                  {article.tags.length > 0 ? (
                    <Group gap={6} mt="sm">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" size="xs" color="gray">
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                  ) : null}
                  <Text size="xs" c="dimmed" mt="sm" className={styles.cardDate}>
                    Cập nhật {formatDateVi(article.updatedAt)}
                  </Text>
                </Link>
                <div
                  className={styles.favoriteSlot}
                  onClick={(event: MouseEvent) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  <HandbookFavoriteButton
                    articleId={article.id}
                    initialFavorited={isFavorited}
                    isGuest={isGuest}
                    size="sm"
                    stopPropagation
                    onToggle={handleFavoriteToggle}
                  />
                </div>
              </div>
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}
