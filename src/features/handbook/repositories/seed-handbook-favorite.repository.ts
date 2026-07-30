import type { HandbookFavoriteRepository } from "./handbook-favorite.repository";

const favoritesByUser = new Map<string, Map<string, string>>();

function userMap(userId: string): Map<string, string> {
  let map = favoritesByUser.get(userId);
  if (!map) {
    map = new Map();
    favoritesByUser.set(userId, map);
  }
  return map;
}

export class SeedHandbookFavoriteRepository implements HandbookFavoriteRepository {
  async listFavorites(userId: string) {
    const map = userMap(userId);
    return [...map.entries()]
      .map(([articleId, createdAt]) => ({
        userId,
        articleId,
        createdAt,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async isFavorite(userId: string, articleId: string) {
    return userMap(userId).has(articleId);
  }

  async addFavorite(userId: string, articleId: string) {
    const createdAt = new Date().toISOString();
    userMap(userId).set(articleId, createdAt);
    return { userId, articleId, createdAt };
  }

  async removeFavorite(userId: string, articleId: string) {
    userMap(userId).delete(articleId);
  }
}
