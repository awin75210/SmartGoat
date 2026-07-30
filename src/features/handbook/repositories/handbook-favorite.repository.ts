import type { HandbookFavorite } from "../types/handbook-favorite.types";

export interface HandbookFavoriteRepository {
  listFavorites(userId: string): Promise<HandbookFavorite[]>;
  isFavorite(userId: string, articleId: string): Promise<boolean>;
  addFavorite(userId: string, articleId: string): Promise<HandbookFavorite>;
  removeFavorite(userId: string, articleId: string): Promise<void>;
}
