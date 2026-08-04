import { requireFarmContext, resolveAppSession } from "@/lib/auth/server-context";
import { handbookService } from "@/features/handbook/services/handbook.service";
import { handbookFavoriteService } from "@/features/handbook/services/handbook-favorite.service";
import { HandbookPage } from "@/features/handbook/components/HandbookPage";

export default async function HandbookRoutePage() {
  const session = await resolveAppSession();
  await requireFarmContext();
  const articles = await handbookService.listArticles();
  const favoriteIds = await handbookFavoriteService.listFavoriteArticleIds(session.userId);

  return <HandbookPage articles={articles} favoriteIds={favoriteIds} isGuest={false} />;
}
