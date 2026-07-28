import { Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { formatDateVi } from "@/shared/utils/format";
import { HANDBOOK_CATEGORY_LABELS, type HandbookArticle } from "../types/handbook.types";
import styles from "./HandbookArticleDetail.module.css";

type HandbookArticleDetailProps = {
  article: HandbookArticle;
};

export function HandbookArticleDetail({ article }: HandbookArticleDetailProps) {
  return (
    <Stack gap="lg">
      <PageHeader title={article.title} description={article.summary} />
      <Paper withBorder radius="md" p="lg" className={styles.card}>
        <Group gap="xs" mb="md">
          <Badge>{HANDBOOK_CATEGORY_LABELS[article.category]}</Badge>
          <Text size="xs" c="dimmed">
            Cập nhật {formatDateVi(article.updatedAt)}
          </Text>
        </Group>
        {article.tags.length > 0 ? (
          <Group gap={6} mb="md">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
          </Group>
        ) : null}
        <Title order={5} className={styles.section} mb="sm">
          Nội dung
        </Title>
        <Text className={styles.body}>{article.body}</Text>
      </Paper>
    </Stack>
  );
}
