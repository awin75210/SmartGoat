import { HANDBOOK_CATEGORY_META, type HandbookArticle } from "../types/handbook.types";

export function articleMatchesSearch(article: HandbookArticle, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  const categoryLabel = HANDBOOK_CATEGORY_META[article.category].label.toLowerCase();

  return (
    article.title.toLowerCase().includes(query) ||
    article.summary.toLowerCase().includes(query) ||
    article.body.toLowerCase().includes(query) ||
    categoryLabel.includes(query) ||
    article.tags.some((tag) => tag.toLowerCase().includes(query))
  );
}

export function filterHandbookArticles(
  articles: HandbookArticle[],
  params: {
    search: string;
    category: string;
    favoriteIds: Set<string>;
  },
): HandbookArticle[] {
  const query = params.search.trim();

  return articles.filter((article) => {
    if (params.category === "favorites" && !params.favoriteIds.has(article.id)) {
      return false;
    }
    if (
      params.category !== "all" &&
      params.category !== "favorites" &&
      article.category !== params.category
    ) {
      return false;
    }
    return articleMatchesSearch(article, query);
  });
}
