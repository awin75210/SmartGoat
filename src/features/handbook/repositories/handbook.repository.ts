import type { HandbookArticle, HandbookCategory } from "../types/handbook.types";

export interface HandbookRepository {
  listArticles(): Promise<HandbookArticle[]>;
  getArticleById(articleId: string): Promise<HandbookArticle | null>;
  listByCategory(category: HandbookCategory): Promise<HandbookArticle[]>;
}
