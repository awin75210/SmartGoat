import { createHandbookFavoriteRepository } from "../repositories/create-handbook-favorite.repository";
import { handbookService } from "./handbook.service";
import type { HandbookArticle } from "../types/handbook.types";

export class HandbookFavoriteService {
  private readonly repo = createHandbookFavoriteRepository();

  async listFavoriteArticleIds(userId: string): Promise<string[]> {
    const rows = await this.repo.listFavorites(userId);
    return rows.map((r) => r.articleId);
  }

  async listFavoriteArticles(userId: string): Promise<HandbookArticle[]> {
    const ids = await this.listFavoriteArticleIds(userId);
    if (ids.length === 0) return [];

    const all = await handbookService.listArticles();
    const byId = new Map(all.map((a) => [a.id, a]));
    return ids.map((id) => byId.get(id)).filter((a): a is HandbookArticle => Boolean(a));
  }

  async toggleFavorite(userId: string, articleId: string): Promise<{ favorited: boolean }> {
    await handbookService.getArticle(articleId);

    const exists = await this.repo.isFavorite(userId, articleId);
    if (exists) {
      await this.repo.removeFavorite(userId, articleId);
      return { favorited: false };
    }
    await this.repo.addFavorite(userId, articleId);
    return { favorited: true };
  }
}

export const handbookFavoriteService = new HandbookFavoriteService();
