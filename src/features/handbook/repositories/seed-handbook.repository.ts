import { HANDBOOK_ARTICLES_SEED } from "../data/handbook.seed";
import { mapHandbookRowToDomain } from "../mappers/handbook.mapper";
import type { HandbookCategory } from "../types/handbook.types";
import type { HandbookRepository } from "./handbook.repository";

export class SeedHandbookRepository implements HandbookRepository {
  async listArticles() {
    return HANDBOOK_ARTICLES_SEED.map(mapHandbookRowToDomain);
  }

  async getArticleById(articleId: string) {
    const row = HANDBOOK_ARTICLES_SEED.find((a) => a.id === articleId);
    return row ? mapHandbookRowToDomain(row) : null;
  }

  async listByCategory(category: HandbookCategory) {
    return HANDBOOK_ARTICLES_SEED.filter((a) => a.category === category).map(
      mapHandbookRowToDomain,
    );
  }
}
