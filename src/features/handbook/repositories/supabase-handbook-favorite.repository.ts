import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { HandbookFavorite } from "../types/handbook-favorite.types";
import type { HandbookFavoriteRepository } from "./handbook-favorite.repository";

function mapRow(row: Record<string, unknown>): HandbookFavorite {
  return {
    userId: String(row.user_id),
    articleId: String(row.article_id),
    createdAt: String(row.created_at),
  };
}

export class SupabaseHandbookFavoriteRepository implements HandbookFavoriteRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async listFavorites(userId: string): Promise<HandbookFavorite[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("handbook_favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  }

  async isFavorite(userId: string, articleId: string): Promise<boolean> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("handbook_favorites")
      .select("article_id")
      .eq("user_id", userId)
      .eq("article_id", articleId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  async addFavorite(userId: string, articleId: string): Promise<HandbookFavorite> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("handbook_favorites")
      .insert({ user_id: userId, article_id: articleId })
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  }

  async removeFavorite(userId: string, articleId: string): Promise<void> {
    const supabase = await this.client();
    const { error } = await supabase
      .from("handbook_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("article_id", articleId);
    if (error) throw error;
  }
}
