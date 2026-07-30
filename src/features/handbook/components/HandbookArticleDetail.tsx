import { type CSSProperties } from "react";
import { Badge, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import {
  IconBabyCarriage,
  IconBulb,
  IconLeaf,
  IconPlant2,
  IconPoint,
  IconStethoscope,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import { formatDateVi } from "@/shared/utils/format";
import {
  HANDBOOK_CATEGORY_META,
  type HandbookArticle,
  type HandbookCategory,
} from "../types/handbook.types";
import { formatHandbookBody } from "../utils/format-handbook-body";
import { buildHandbookToc } from "../utils/handbook-sidebar.utils";
import { HandbookArticleBackLink } from "./HandbookArticleBackLink";
import { HandbookFavoriteButton } from "./HandbookFavoriteButton";
import { HandbookArticleSidebar } from "./HandbookArticleSidebar";
import { HandbookArticleSidebarColumn } from "./HandbookArticleSidebarColumn";
import styles from "./HandbookArticleDetail.module.css";

type HandbookArticleDetailProps = {
  article: HandbookArticle;
  relatedArticles: HandbookArticle[];
  isGuest: boolean;
  isFavorited: boolean;
};

const CATEGORY_ICONS: Record<HandbookCategory, TablerIcon> = {
  farming_technique: IconPlant2,
  nutrition: IconLeaf,
  common_diseases: IconStethoscope,
  kid_care_stages: IconBabyCarriage,
};

export function HandbookArticleDetail({
  article,
  relatedArticles,
  isGuest,
  isFavorited,
}: HandbookArticleDetailProps) {
  const meta = HANDBOOK_CATEGORY_META[article.category];
  const Icon = CATEGORY_ICONS[article.category];
  const bodyBlocks = formatHandbookBody(article.body);
  const toc = buildHandbookToc(bodyBlocks);
  const accentStyle = { "--category-accent": meta.accent } as CSSProperties;

  return (
    <div className={styles.page}>
      <HandbookArticleBackLink />

      <div className={styles.layout}>
        <Stack gap="lg" className={styles.main}>
          <Paper
            withBorder
            radius="md"
            p="lg"
            className={styles.hero}
            style={accentStyle}
          >
            <Group gap="sm" mb="sm" justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size="lg" radius="md" variant="light" color={meta.color}>
                  <Icon size={20} stroke={1.5} />
                </ThemeIcon>
                <div>
                  <Badge color={meta.color} variant="light">
                    {meta.label}
                  </Badge>
                  <Text size="xs" c="dimmed" mt={4}>
                    Cập nhật {formatDateVi(article.updatedAt)}
                  </Text>
                </div>
              </Group>
              <HandbookFavoriteButton
                articleId={article.id}
                initialFavorited={isFavorited}
                isGuest={isGuest}
                size="lg"
              />
            </Group>
            <Title order={2} className={styles.title}>
              {article.title}
            </Title>
            {article.tags.length > 0 ? (
              <Group gap={6} mt="md">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" size="sm" color="gray">
                    {tag}
                  </Badge>
                ))}
              </Group>
            ) : null}
          </Paper>

          <Paper radius="md" p="md" className={styles.summaryBox} id="summary">
            <Group gap="xs" mb="xs">
              <ThemeIcon size="sm" radius="xl" variant="light" color="capraBlue">
                <IconBulb size={14} stroke={1.5} />
              </ThemeIcon>
              <Text size="sm" fw={700} className={styles.summaryLabel}>
                Tóm tắt nhanh
              </Text>
            </Group>
            <Text size="sm" className={styles.summaryText}>
              {article.summary}
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="lg" className={styles.contentCard} id="content">
            <Title order={5} className={styles.sectionTitle} mb="md">
              Nội dung chi tiết
            </Title>
            <div className={styles.bodyBlock}>
              {bodyBlocks.map((block, index) => {
                if (block.type === "bullet") {
                  return (
                    <div key={`b-${index}`} id={`section-${index}`} className={styles.bodyListItem}>
                      <IconPoint size={14} className={styles.bulletIcon} stroke={2} />
                      <Text
                        size="sm"
                        className={block.emphasis ? styles.bodyEmphasis : styles.bodyText}
                      >
                        {block.text}
                      </Text>
                    </div>
                  );
                }
                return (
                  <Text key={`p-${index}`} id={`section-${index}`} size="sm" className={styles.bodyText}>
                    {block.text}
                  </Text>
                );
              })}
            </div>
          </Paper>
        </Stack>

        <HandbookArticleSidebarColumn>
          <HandbookArticleSidebar toc={toc} relatedArticles={relatedArticles} accent={meta.accent} />
        </HandbookArticleSidebarColumn>
      </div>
    </div>
  );
}
