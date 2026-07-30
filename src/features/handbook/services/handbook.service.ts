import { AppError } from "@/lib/errors/app-error";
import { createHandbookRepository } from "../repositories/create-handbook.repository";
import type { HandbookArticle } from "../types/handbook.types";
import { pickRelatedHandbookArticles } from "../utils/handbook-sidebar.utils";

export class HandbookService {
  private readonly repo = createHandbookRepository();

  async listArticles(): Promise<HandbookArticle[]> {
    return this.repo.listArticles();
  }

  async getArticle(articleId: string): Promise<HandbookArticle> {
    const article = await this.repo.getArticleById(articleId);
    if (!article) {
      throw new AppError("NOT_FOUND");
    }
    return article;
  }

  async getRelatedArticles(articleId: string, limit = 5): Promise<HandbookArticle[]> {
    const [current, all] = await Promise.all([this.getArticle(articleId), this.listArticles()]);
    return pickRelatedHandbookArticles(current, all, limit);
  }
}

export const handbookService = new HandbookService();
