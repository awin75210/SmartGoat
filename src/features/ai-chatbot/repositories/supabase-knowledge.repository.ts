import { createSupabaseServerClient } from "@/lib/supabase/server-client";
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
    if (lower.includes(token)) score += 2;
  }
  return score;
}

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
  ): Promise<{ articles: KnowledgeArticle[]; faqs: KnowledgeFaq[] }> {
    const [articles, faqs] = await Promise.all([
      this.listPublishedArticles(),
      this.listPublishedFaqs(),
    ]);
    const queryTokens = tokenize(query);

    const rankedArticles = articles
      .map((a) => ({
        item: a,
        score:
          scoreText(queryTokens, a.title) * 3 +
          scoreText(queryTokens, a.content) +
          scoreText(queryTokens, a.keywords.join(" ")),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.item);

    const remaining = Math.max(0, limit - rankedArticles.length);
    const rankedFaqs = faqs
      .map((f) => ({
        item: f,
        score:
          scoreText(queryTokens, f.question) * 3 +
          scoreText(queryTokens, f.answer) +
          scoreText(queryTokens, f.keywords.join(" ")) +
          f.priority * 0.1,
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, remaining > 0 ? remaining : limit)
      .map((r) => r.item);

    return {
      articles: rankedArticles,
      faqs: rankedFaqs.slice(0, Math.max(0, limit - rankedArticles.length)),
    };
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

  async upsertArticle(id: string | null, input: KnowledgeArticleInput): Promise<KnowledgeArticle> {
    const supabase = await this.client();
    const payload = {
      title: input.title,
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
