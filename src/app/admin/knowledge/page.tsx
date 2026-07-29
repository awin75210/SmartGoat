import { requireAdminContext } from "@/lib/auth/server-context";
import { createKnowledgeRepository } from "@/features/ai-chatbot/repositories/create-knowledge.repository";
import { KnowledgeAdminClient } from "@/features/ai-chatbot/components/KnowledgeAdminClient";

export default async function AdminKnowledgePage() {
  await requireAdminContext();
  const repo = createKnowledgeRepository();
  const [articles, faqs] = await Promise.all([repo.listAllArticlesAdmin(), repo.listAllFaqsAdmin()]);

  return <KnowledgeAdminClient initialArticles={articles} initialFaqs={faqs} />;
}
