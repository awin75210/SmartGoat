import { z } from "zod";
import { KNOWLEDGE_CATEGORY_SLUGS } from "../constants/knowledge-categories";

export const knowledgeCategorySchema = z.enum(KNOWLEDGE_CATEGORY_SLUGS);

export const CHAT_MESSAGE_MAX_LENGTH = 2000;

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập câu hỏi")
    .max(CHAT_MESSAGE_MAX_LENGTH, `Câu hỏi tối đa ${CHAT_MESSAGE_MAX_LENGTH} ký tự`),
  conversationId: z.uuid().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(CHAT_MESSAGE_MAX_LENGTH),
      }),
    )
    .max(20)
    .optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

export const knowledgeArticleInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1).max(20000),
  category: knowledgeCategorySchema,
  keywords: z.string().max(500).optional(),
  status: z.enum(["draft", "published", "hidden"]),
});

export const knowledgeFaqInputSchema = z.object({
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(10000),
  keywords: z.string().max(500).optional(),
  priority: z.number().int().min(0).max(1000).optional(),
  status: z.enum(["draft", "published", "hidden"]),
});

export type KnowledgeArticleInput = z.infer<typeof knowledgeArticleInputSchema>;
export type KnowledgeFaqInput = z.infer<typeof knowledgeFaqInputSchema>;
