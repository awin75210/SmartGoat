import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { HandbookFavoriteRepository } from "./handbook-favorite.repository";
import { SeedHandbookFavoriteRepository } from "./seed-handbook-favorite.repository";
import { SupabaseHandbookFavoriteRepository } from "./supabase-handbook-favorite.repository";

export function createHandbookFavoriteRepository(): HandbookFavoriteRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseHandbookFavoriteRepository();
  }
  return new SeedHandbookFavoriteRepository();
}
