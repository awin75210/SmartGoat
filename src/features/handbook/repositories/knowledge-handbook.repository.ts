import { createKnowledgeRepository } from "@/features/ai-chatbot/repositories/create-knowledge.repository";
import { mapKnowledgeArticleToHandbook } from "../mappers/handbook-from-knowledge.mapper";
import type { HandbookCategory } from "../types/handbook.types";
import type { HandbookRepository } from "./handbook.repository";

/** Sổ tay điện tử đọc cùng nguồn bài viết với AI chat (knowledge_articles published). */
export class KnowledgeHandbookRepository implements HandbookRepository {
  private readonly knowledgeRepo = createKnowledgeRepository();

  async listArticles() {
    const articles = await this.knowledgeRepo.listPublishedArticles();
    return articles
      .map(mapKnowledgeArticleToHandbook)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getArticleById(articleId: string) {
    const articles = await this.listArticles();
    const direct = articles.find((a) => a.id === articleId);
    if (direct) return direct;
    if (articleId.startsWith("hb-")) {
      return articles.find((a) => a.id === articleId.replace(/^hb-/, "ka-")) ?? null;
    }
    return null;
  }

  async listByCategory(category: HandbookCategory) {
    const articles = await this.listArticles();
    return articles.filter((a) => a.category === category);
  }
}
