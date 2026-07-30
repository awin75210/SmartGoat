import { notFound } from "next/navigation";
import { resolveAppSession } from "@/lib/auth/server-context";
import { AppError } from "@/lib/errors/app-error";
import { handbookService } from "@/features/handbook/services/handbook.service";
import { handbookFavoriteService } from "@/features/handbook/services/handbook-favorite.service";
import { HandbookArticleDetail } from "@/features/handbook/components/HandbookArticleDetail";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

export default async function HandbookArticlePage({ params }: PageProps) {
  const session = await resolveAppSession();
  const { articleId } = await params;

  let article;
  let relatedArticles;
  let isFavorited = false;

  try {
    [article, relatedArticles] = await Promise.all([
      handbookService.getArticle(articleId),
      handbookService.getRelatedArticles(articleId),
    ]);
    if (!session.isGuest) {
      const favoriteIds = await handbookFavoriteService.listFavoriteArticleIds(session.userId);
      isFavorited = favoriteIds.includes(article.id);
    }
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return (
    <HandbookArticleDetail
      article={article}
      relatedArticles={relatedArticles}
      isGuest={session.isGuest}
      isFavorited={isFavorited}
    />
  );
}
