import type { HandbookArticle } from "../types/handbook.types";
import type { HandbookBodyBlock } from "./format-handbook-body";

export type HandbookTocEntry = {
  id: string;
  label: string;
};

function tocLabelFromBlock(block: HandbookBodyBlock): string {
  const text = block.text.trim();
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx <= 28) {
    return text.slice(0, colonIdx).trim();
  }
  if (text.length <= 44) return text;
  return `${text.slice(0, 41).trim()}…`;
}

/** Mục lục nội dung bài viết cho sidebar phụ lục. */
export function buildHandbookToc(blocks: HandbookBodyBlock[]): HandbookTocEntry[] {
  const entries: HandbookTocEntry[] = [
    { id: "summary", label: "Tóm tắt nhanh" },
    { id: "content", label: "Nội dung chi tiết" },
  ];

  blocks.forEach((block, index) => {
    entries.push({
      id: `section-${index}`,
      label: tocLabelFromBlock(block),
    });
  });

  return entries;
}

function scoreRelatedArticle(current: HandbookArticle, candidate: HandbookArticle): number {
  let score = 0;
  if (candidate.category === current.category) score += 3;
  for (const tag of candidate.tags) {
    if (current.tags.includes(tag)) score += 2;
  }
  return score;
}

/** Bài viết liên quan: cùng danh mục hoặc trùng tag. */
export function pickRelatedHandbookArticles(
  current: HandbookArticle,
  all: HandbookArticle[],
  limit = 5,
): HandbookArticle[] {
  const ranked = all
    .filter((a) => a.id !== current.id)
    .map((article) => ({ article, score: scoreRelatedArticle(current, article) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.article.updatedAt.localeCompare(a.article.updatedAt));

  if (ranked.length > 0) {
    return ranked.slice(0, limit).map((r) => r.article);
  }

  return all
    .filter((a) => a.id !== current.id && a.category === current.category)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}
