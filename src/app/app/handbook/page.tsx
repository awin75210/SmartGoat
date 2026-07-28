import { requireFarmContext } from "@/lib/auth/server-context";
import { handbookService } from "@/features/handbook/services/handbook.service";
import { HandbookPage } from "@/features/handbook/components/HandbookPage";

export default async function HandbookRoutePage() {
  await requireFarmContext();
  const articles = await handbookService.listArticles();

  return <HandbookPage articles={articles} />;
}
