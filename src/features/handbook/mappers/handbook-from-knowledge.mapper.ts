import type { KnowledgeArticle } from "@/features/ai-chatbot/types/chatbot.types";
import { normalizeKnowledgeCategory } from "@/features/ai-chatbot/constants/knowledge-categories";
import type { HandbookArticle, HandbookCategory } from "../types/handbook.types";

function fallbackSummary(content: string): string {
  const line = content.split("\n")[0]?.trim() ?? content.trim();
  if (line.length <= 160) return line;
  return `${line.slice(0, 157)}...`;
}

export function mapKnowledgeArticleToHandbook(article: KnowledgeArticle): HandbookArticle {
  const category = normalizeKnowledgeCategory(article.category) as HandbookCategory;
  return {
    id: article.id,
    category,
    title: article.title,
    summary: article.summary.trim() || fallbackSummary(article.content),
    body: article.content,
    tags: article.keywords,
    updatedAt: article.updatedAt,
  };
}
