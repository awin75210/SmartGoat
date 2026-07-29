import type { KnowledgeArticle, KnowledgeFaq, KnowledgeStatus } from "../types/chatbot.types";
import type { KnowledgeArticleInput, KnowledgeFaqInput } from "../schemas/chatbot.schema";

export interface KnowledgeRepository {
  listPublishedArticles(): Promise<KnowledgeArticle[]>;
  listPublishedFaqs(): Promise<KnowledgeFaq[]>;
  searchPublished(query: string, limit: number): Promise<{ articles: KnowledgeArticle[]; faqs: KnowledgeFaq[] }>;

  listAllArticlesAdmin(): Promise<KnowledgeArticle[]>;
  listAllFaqsAdmin(): Promise<KnowledgeFaq[]>;
  upsertArticle(id: string | null, input: KnowledgeArticleInput): Promise<KnowledgeArticle>;
  upsertFaq(id: string | null, input: KnowledgeFaqInput): Promise<KnowledgeFaq>;
  setArticleStatus(id: string, status: KnowledgeStatus): Promise<void>;
  setFaqStatus(id: string, status: KnowledgeStatus): Promise<void>;
  isArticleReferencedInChat(articleId: string): Promise<boolean>;
  isFaqReferencedInChat(faqId: string): Promise<boolean>;
}
