import type { HandbookArticle, HandbookArticleRow } from "../types/handbook.types";

export function mapHandbookRowToDomain(row: HandbookArticleRow): HandbookArticle {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    summary: row.summary,
    body: row.body,
    tags: row.tags.split(",").map((t) => t.trim()).filter(Boolean),
    updatedAt: row.updated_at,
  };
}
