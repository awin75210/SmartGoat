import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  mapKnowledgeArticleRow,
  mapKnowledgeFaqRow,
} from "../mappers/chatbot.mappers";
import type { KnowledgeArticleInput, KnowledgeFaqInput } from "../schemas/chatbot.schema";
import type { KnowledgeArticle, KnowledgeFaq, KnowledgeStatus } from "../types/chatbot.types";
import type { KnowledgeRepository } from "./knowledge.repository";
import { normalizeKnowledgeKey } from "../utils/normalize-knowledge-key";

import { rankPublishedKnowledge } from "../utils/knowledge-retrieval.utils";
import type { QueryIntent } from "../services/query-intent.service";

export class SupabaseKnowledgeRepository implements KnowledgeRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async listPublishedArticles(): Promise<KnowledgeArticle[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select("*")
      .eq("status", "published");
    if (error) throw error;
    return (data ?? []).map((row) => mapKnowledgeArticleRow(row));
  }

  async listPublishedFaqs(): Promise<KnowledgeFaq[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("knowledge_faqs")
      .select("*")
      .eq("status", "published");
    if (error) throw error;
    return (data ?? []).map((row) => mapKnowledgeFaqRow(row));
  }

  async searchPublished(
    query: string,
    limit: number,
    intent: QueryIntent = {
      needsIot: false,
      needsHerd: false,
      isHealthRelated: false,
      isNutritionRelated: false,
    },
  ): Promise<{ articles: KnowledgeArticle[]; faqs: KnowledgeFaq[] }> {
    const [articles, faqs] = await Promise.all([
      this.listPublishedArticles(),
      this.listPublishedFaqs(),
    ]);
    return rankPublishedKnowledge(articles, faqs, query, intent, limit);
  }

  async listAllArticlesAdmin(): Promise<KnowledgeArticle[]> {
    const supabase = await this.client();
    const { data, error } = await supabase.from("knowledge_articles").select("*").order("updated_at", {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []).map((row) => mapKnowledgeArticleRow(row));
  }

  async listAllFaqsAdmin(): Promise<KnowledgeFaq[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("knowledge_faqs")
      .select("*")
      .order("priority", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapKnowledgeFaqRow(row));
  }

  async findArticleByTitle(title: string): Promise<KnowledgeArticle | null> {
    const articles = await this.listAllArticlesAdmin();
    const key = normalizeKnowledgeKey(title);
    return articles.find((a) => normalizeKnowledgeKey(a.title) === key) ?? null;
  }

  async findFaqByQuestion(question: string): Promise<KnowledgeFaq | null> {
    const faqs = await this.listAllFaqsAdmin();
    const key = normalizeKnowledgeKey(question);
    return faqs.find((f) => normalizeKnowledgeKey(f.question) === key) ?? null;
  }

  async upsertArticle(id: string | null, input: KnowledgeArticleInput): Promise<KnowledgeArticle> {
    const supabase = await this.client();
    const payload = {
      title: input.title,
      summary: input.summary?.trim() ?? "",
      content: input.content,
      category: input.category,
      keywords: input.keywords?.trim() ?? "",
      status: input.status,
      updated_at: new Date().toISOString(),
    };
    if (id) {
      const { data, error } = await supabase
        .from("knowledge_articles")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return mapKnowledgeArticleRow(data);
    }
    const { data, error } = await supabase
      .from("knowledge_articles")
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select("*")
      .single();
    if (error) throw error;
    return mapKnowledgeArticleRow(data);
  }

  async upsertFaq(id: string | null, input: KnowledgeFaqInput): Promise<KnowledgeFaq> {
    const supabase = await this.client();
    const payload = {
      question: input.question,
      answer: input.answer,
      keywords: input.keywords?.trim() ?? "",
      priority: input.priority ?? 0,
      status: input.status,
    };
    if (id) {
      const { data, error } = await supabase
        .from("knowledge_faqs")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return mapKnowledgeFaqRow(data);
    }
    const { data, error } = await supabase
      .from("knowledge_faqs")
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select("*")
      .single();
    if (error) throw error;
    return mapKnowledgeFaqRow(data);
  }

  async setArticleStatus(id: string, status: KnowledgeStatus): Promise<void> {
    const supabase = await this.client();
    const { error } = await supabase.from("knowledge_articles").update({ status }).eq("id", id);
    if (error) throw error;
  }

  async setFaqStatus(id: string, status: KnowledgeStatus): Promise<void> {
    const supabase = await this.client();
    const { error } = await supabase.from("knowledge_faqs").update({ status }).eq("id", id);
    if (error) throw error;
  }

  async isArticleReferencedInChat(articleId: string): Promise<boolean> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("chat_messages")
      .select("id")
      .contains("sources", [{ type: "article", id: articleId }])
      .limit(1);
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }

  async isFaqReferencedInChat(faqId: string): Promise<boolean> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("chat_messages")
      .select("id")
      .contains("sources", [{ type: "faq", id: faqId }])
      .limit(1);
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }
}
