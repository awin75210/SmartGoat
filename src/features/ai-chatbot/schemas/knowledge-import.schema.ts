import { z } from "zod";
import { normalizeKnowledgeCategory } from "../constants/knowledge-categories";
import {
  knowledgeArticleInputSchema,
  knowledgeFaqInputSchema,
} from "./chatbot.schema";

const knowledgeStatusSchema = z.enum(["draft", "published", "hidden"]);

function emptyToUndefined(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

function coerceString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  return String(value).trim();
}

function coercePriority(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (Number.isNaN(n)) return undefined;
  return Math.trunc(n);
}

export const knowledgeImportArticleRowSchema = z.preprocess(
  (raw) => {
    if (typeof raw !== "object" || raw === null) return raw;
    const row = raw as Record<string, unknown>;
    return {
      title: coerceString(row.title),
      summary: emptyToUndefined(row.summary) ?? "",
      category: normalizeKnowledgeCategory(coerceString(row.category)),
      keywords: emptyToUndefined(row.keywords) ?? "",
      content: coerceString(row.content),
      status: emptyToUndefined(row.status) ?? "draft",
    };
  },
  knowledgeArticleInputSchema,
);

export const knowledgeImportFaqRowSchema = z.preprocess(
  (raw) => {
    if (typeof raw !== "object" || raw === null) return raw;
    const row = raw as Record<string, unknown>;
    return {
      question: coerceString(row.question),
      answer: coerceString(row.answer),
      keywords: emptyToUndefined(row.keywords) ?? "",
      priority: coercePriority(row.priority) ?? 0,
      status: emptyToUndefined(row.status) ?? "draft",
    };
  },
  knowledgeFaqInputSchema,
);

export type ParsedKnowledgeImport = {
  articles: { rowNumber: number; data: z.infer<typeof knowledgeArticleInputSchema> }[];
  faqs: { rowNumber: number; data: z.infer<typeof knowledgeFaqInputSchema> }[];
  parseErrors: KnowledgeImportRowError[];
};

export type KnowledgeImportRowError = {
  sheet: "Articles" | "FAQs";
  row: number;
  message: string;
};

export type KnowledgeImportResult = {
  articlesCreated: number;
  articlesUpdated: number;
  faqsCreated: number;
  faqsUpdated: number;
  errors: KnowledgeImportRowError[];
};

export { knowledgeStatusSchema };
