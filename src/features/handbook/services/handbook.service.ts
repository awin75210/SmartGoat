import { AppError } from "@/lib/errors/app-error";
import { createHandbookRepository } from "../repositories/create-handbook.repository";
import type { HandbookArticle } from "../types/handbook.types";

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
}

export const handbookService = new HandbookService();
