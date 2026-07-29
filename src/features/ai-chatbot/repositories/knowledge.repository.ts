import type { KnowledgeArticle, KnowledgeFaq, KnowledgeStatus } from "../types/chatbot.types";
import type { KnowledgeArticleInput, KnowledgeFaqInput } from "../schemas/chatbot.schema";
import type { QueryIntent } from "../services/query-intent.service";

export interface KnowledgeRepository {
  listPublishedArticles(): Promise<KnowledgeArticle[]>;
  listPublishedFaqs(): Promise<KnowledgeFaq[]>;
  searchPublished(
    query: string,
    limit: number,
    intent?: QueryIntent,
  ): Promise<{ articles: KnowledgeArticle[]; faqs: KnowledgeFaq[] }>;

  listAllArticlesAdmin(): Promise<KnowledgeArticle[]>;
  listAllFaqsAdmin(): Promise<KnowledgeFaq[]>;
  findArticleByTitle(title: string): Promise<KnowledgeArticle | null>;
  findFaqByQuestion(question: string): Promise<KnowledgeFaq | null>;
  upsertArticle(id: string | null, input: KnowledgeArticleInput): Promise<KnowledgeArticle>;
  upsertFaq(id: string | null, input: KnowledgeFaqInput): Promise<KnowledgeFaq>;
  setArticleStatus(id: string, status: KnowledgeStatus): Promise<void>;
  setFaqStatus(id: string, status: KnowledgeStatus): Promise<void>;
  isArticleReferencedInChat(articleId: string): Promise<boolean>;
  isFaqReferencedInChat(faqId: string): Promise<boolean>;
}
