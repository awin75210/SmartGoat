import { notFound } from "next/navigation";
import { requireFarmContext } from "@/lib/auth/server-context";
import { AppError } from "@/lib/errors/app-error";
import { handbookService } from "@/features/handbook/services/handbook.service";
import { HandbookArticleDetail } from "@/features/handbook/components/HandbookArticleDetail";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

export default async function HandbookArticlePage({ params }: PageProps) {
  await requireFarmContext();
  const { articleId } = await params;

  let article;
  try {
    article = await handbookService.getArticle(articleId);
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return <HandbookArticleDetail article={article} />;
}
