"use server";

import { revalidatePath } from "next/cache";
import { requireAdminContext, requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { AppError } from "@/lib/errors/app-error";
import {
  actionFailure,
  toActionResult,
  type ActionResult,
} from "@/lib/errors/action-result";
import {
  knowledgeArticleInputSchema,
  knowledgeFaqInputSchema,
} from "../schemas/chatbot.schema";
import { chatbotService } from "../services/chatbot.service";
import { createKnowledgeRepository } from "../repositories/create-knowledge.repository";
import type { ChatConversation, ChatMessage, KnowledgeArticle, KnowledgeFaq } from "../types/chatbot.types";

export async function listChatConversationsAction(): Promise<ActionResult<ChatConversation[]>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    return chatbotService.listConversations(ctx.userId, ctx.farmId);
  });
}

export async function createChatConversationAction(): Promise<ActionResult<ChatConversation>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    return chatbotService.createConversation(ctx.userId, ctx.farmId);
  });
}

export async function loadChatMessagesAction(
  conversationId: string,
): Promise<ActionResult<ChatMessage[]>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    return chatbotService.getConversationMessages(ctx.userId, ctx.farmId, conversationId);
  });
}

export async function listKnowledgeFaqsAdminAction(): Promise<ActionResult<KnowledgeFaq[]>> {
  return toActionResult(async () => {
    await requireAdminContext();
    const repo = createKnowledgeRepository();
    return repo.listAllFaqsAdmin();
  });
}

export async function listKnowledgeArticlesAdminAction(): Promise<ActionResult<KnowledgeArticle[]>> {
  return toActionResult(async () => {
    await requireAdminContext();
    const repo = createKnowledgeRepository();
    return repo.listAllArticlesAdmin();
  });
}

export async function saveKnowledgeArticleAdminAction(
  id: string | null,
  input: unknown,
): Promise<ActionResult<KnowledgeArticle>> {
  const parsed = knowledgeArticleInputSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure("VALIDATION_ERROR", parsed.error.issues[0]?.message);
  }
  return toActionResult(async () => {
    await requireAdminContext();
    const repo = createKnowledgeRepository();
    const article = await repo.upsertArticle(id, parsed.data);
    revalidatePath("/admin/knowledge");
    return article;
  });
}

export async function saveKnowledgeFaqAdminAction(
  id: string | null,
  input: unknown,
): Promise<ActionResult<KnowledgeFaq>> {
  const parsed = knowledgeFaqInputSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure("VALIDATION_ERROR", parsed.error.issues[0]?.message);
  }
  return toActionResult(async () => {
    await requireAdminContext();
    const repo = createKnowledgeRepository();
    const faq = await repo.upsertFaq(id, parsed.data);
    revalidatePath("/admin/knowledge");
    return faq;
  });
}

export async function setKnowledgeArticleStatusAction(
  id: string,
  status: "draft" | "published" | "hidden",
): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    await requireAdminContext();
    const repo = createKnowledgeRepository();
    if (status === "hidden") {
      const inUse = await repo.isArticleReferencedInChat(id);
      if (inUse) {
        await repo.setArticleStatus(id, "hidden");
        revalidatePath("/admin/knowledge");
        return;
      }
    }
    await repo.setArticleStatus(id, status);
    revalidatePath("/admin/knowledge");
  });
}

export async function setKnowledgeFaqStatusAction(
  id: string,
  status: "draft" | "published" | "hidden",
): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    await requireAdminContext();
    const repo = createKnowledgeRepository();
    await repo.setFaqStatus(id, status);
    revalidatePath("/admin/knowledge");
  });
}

export async function deleteKnowledgeArticleAdminAction(id: string): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    await requireAdminContext();
    const repo = createKnowledgeRepository();
    const inUse = await repo.isArticleReferencedInChat(id);
    if (inUse) {
      throw new AppError("VALIDATION_ERROR", "Không thể xóa bài viết đang được dùng trong hội thoại. Hãy ẩn thay vì xóa.");
    }
    await repo.setArticleStatus(id, "hidden");
    revalidatePath("/admin/knowledge");
  });
}
