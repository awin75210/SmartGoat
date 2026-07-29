import {
  KNOWLEDGE_ARTICLES_SEED,
  KNOWLEDGE_FAQS_SEED,
} from "../data/knowledge.seed";
import {
  mapKnowledgeArticleRow,
  mapKnowledgeFaqRow,
} from "../mappers/chatbot.mappers";
import type { KnowledgeArticleInput, KnowledgeFaqInput } from "../schemas/chatbot.schema";
import type { KnowledgeArticle, KnowledgeFaq, KnowledgeStatus } from "../types/chatbot.types";
import type { KnowledgeRepository } from "./knowledge.repository";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.;:!?()\-–—/]+/)
    .filter((t) => t.length > 1);
}

function scoreText(queryTokens: string[], haystack: string): number {
  const lower = haystack.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (lower.includes(token)) {
      score += 2;
    }
  }
  return score;
}

function scoreArticle(queryTokens: string[], article: KnowledgeArticle): number {
  return (
    scoreText(queryTokens, article.title) * 3 +
    scoreText(queryTokens, article.content) +
    scoreText(queryTokens, article.keywords.join(" "))
  );
}

function scoreFaq(queryTokens: string[], faq: KnowledgeFaq): number {
  return (
    scoreText(queryTokens, faq.question) * 3 +
    scoreText(queryTokens, faq.answer) +
    scoreText(queryTokens, faq.keywords.join(" ")) +
    faq.priority * 0.1
  );
}

let articlesStore = KNOWLEDGE_ARTICLES_SEED.map((row) => mapKnowledgeArticleRow(row));
let faqsStore = KNOWLEDGE_FAQS_SEED.map((row) => mapKnowledgeFaqRow(row));

/** Sources referenced in chat (seed) for soft-delete guard */
const referencedArticleIds = new Set<string>();
const referencedFaqIds = new Set<string>();

export function markKnowledgeSourcesUsed(sources: { type: string; id: string }[]): void {
  for (const s of sources) {
    if (s.type === "article") referencedArticleIds.add(s.id);
    if (s.type === "faq") referencedFaqIds.add(s.id);
  }
}

export class SeedKnowledgeRepository implements KnowledgeRepository {
  async listPublishedArticles(): Promise<KnowledgeArticle[]> {
    return articlesStore.filter((a) => a.status === "published");
  }

  async listPublishedFaqs(): Promise<KnowledgeFaq[]> {
    return faqsStore.filter((f) => f.status === "published");
  }

  async searchPublished(
    query: string,
    limit: number,
  ): Promise<{ articles: KnowledgeArticle[]; faqs: KnowledgeFaq[] }> {
    const queryTokens = tokenize(query);
    const publishedArticles = await this.listPublishedArticles();
    const publishedFaqs = await this.listPublishedFaqs();

    const rankedArticles = publishedArticles
      .map((a) => ({ item: a, score: scoreArticle(queryTokens, a) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.item);

    const remaining = Math.max(0, limit - rankedArticles.length);
    const rankedFaqs = publishedFaqs
      .map((f) => ({ item: f, score: scoreFaq(queryTokens, f) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, remaining > 0 ? remaining : limit)
      .map((r) => r.item);

    const combinedLimit = limit;
    const articles = rankedArticles.slice(0, combinedLimit);
    const faqs = rankedFaqs.slice(0, Math.max(0, combinedLimit - articles.length));

    return { articles, faqs };
  }

  async listAllArticlesAdmin(): Promise<KnowledgeArticle[]> {
    return [...articlesStore];
  }

  async listAllFaqsAdmin(): Promise<KnowledgeFaq[]> {
    return [...faqsStore];
  }

  async upsertArticle(id: string | null, input: KnowledgeArticleInput): Promise<KnowledgeArticle> {
    const now = new Date().toISOString();
    const keywords = input.keywords?.trim() ?? "";
    if (id) {
      const idx = articlesStore.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("NOT_FOUND");
      const updated: KnowledgeArticle = {
        ...articlesStore[idx],
        title: input.title,
        content: input.content,
        category: input.category,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        status: input.status,
        updatedAt: now,
      };
      articlesStore[idx] = updated;
      return updated;
    }
    const newId = `ka-${Date.now()}`;
    const created: KnowledgeArticle = {
      id: newId,
      title: input.title,
      content: input.content,
      category: input.category,
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };
    articlesStore = [...articlesStore, created];
    return created;
  }

  async upsertFaq(id: string | null, input: KnowledgeFaqInput): Promise<KnowledgeFaq> {
    const now = new Date().toISOString();
    const keywords = input.keywords?.trim() ?? "";
    if (id) {
      const idx = faqsStore.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error("NOT_FOUND");
      const updated: KnowledgeFaq = {
        ...faqsStore[idx],
        question: input.question,
        answer: input.answer,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        priority: input.priority ?? faqsStore[idx].priority,
        status: input.status,
      };
      faqsStore[idx] = updated;
      return updated;
    }
    const newId = `kf-${Date.now()}`;
    const created: KnowledgeFaq = {
      id: newId,
      question: input.question,
      answer: input.answer,
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      priority: input.priority ?? 0,
      status: input.status,
      createdAt: now,
    };
    faqsStore = [...faqsStore, created];
    return created;
  }

  async setArticleStatus(id: string, status: KnowledgeStatus): Promise<void> {
    if (status === "hidden" && referencedArticleIds.has(id)) {
      const idx = articlesStore.findIndex((a) => a.id === id);
      if (idx !== -1) {
        articlesStore[idx] = { ...articlesStore[idx], status: "hidden" };
      }
      return;
    }
    const idx = articlesStore.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("NOT_FOUND");
    articlesStore[idx] = { ...articlesStore[idx], status };
  }

  async setFaqStatus(id: string, status: KnowledgeStatus): Promise<void> {
    const idx = faqsStore.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error("NOT_FOUND");
    faqsStore[idx] = { ...faqsStore[idx], status };
  }

  async isArticleReferencedInChat(articleId: string): Promise<boolean> {
    return referencedArticleIds.has(articleId);
  }

  async isFaqReferencedInChat(faqId: string): Promise<boolean> {
    return referencedFaqIds.has(faqId);
  }
}
