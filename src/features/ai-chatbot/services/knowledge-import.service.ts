import { AppError } from "@/lib/errors/app-error";
import { createKnowledgeRepository } from "../repositories/create-knowledge.repository";
import type { KnowledgeImportResult, ParsedKnowledgeImport } from "../schemas/knowledge-import.schema";
import {
  KNOWLEDGE_IMPORT_MAX_FILE_BYTES,
  parseKnowledgeWorkbook,
} from "../lib/knowledge-import-xlsx";

export class KnowledgeImportService {
  private readonly repo = createKnowledgeRepository();

  parseWorkbook(buffer: ArrayBuffer): ParsedKnowledgeImport {
    if (buffer.byteLength > KNOWLEDGE_IMPORT_MAX_FILE_BYTES) {
      throw new AppError("VALIDATION_ERROR", "File vượt quá 5 MB");
    }
    return parseKnowledgeWorkbook(buffer);
  }

  async importParsed(parsed: ParsedKnowledgeImport): Promise<KnowledgeImportResult> {
    const result: KnowledgeImportResult = {
      articlesCreated: 0,
      articlesUpdated: 0,
      faqsCreated: 0,
      faqsUpdated: 0,
      errors: [...parsed.parseErrors],
    };

    for (const { rowNumber, data } of parsed.articles) {
      try {
        const existing = await this.repo.findArticleByTitle(data.title);
        await this.repo.upsertArticle(existing?.id ?? null, data);
        if (existing) {
          result.articlesUpdated += 1;
        } else {
          result.articlesCreated += 1;
        }
      } catch (err) {
        result.errors.push({
          sheet: "Articles",
          row: rowNumber,
          message: err instanceof Error ? err.message : "Không lưu được bài viết",
        });
      }
    }

    for (const { rowNumber, data } of parsed.faqs) {
      try {
        const existing = await this.repo.findFaqByQuestion(data.question);
        await this.repo.upsertFaq(existing?.id ?? null, data);
        if (existing) {
          result.faqsUpdated += 1;
        } else {
          result.faqsCreated += 1;
        }
      } catch (err) {
        result.errors.push({
          sheet: "FAQs",
          row: rowNumber,
          message: err instanceof Error ? err.message : "Không lưu được FAQ",
        });
      }
    }

    return result;
  }

  async importFromBuffer(buffer: ArrayBuffer): Promise<KnowledgeImportResult> {
    const parsed = this.parseWorkbook(buffer);
    return this.importParsed(parsed);
  }
}

export const knowledgeImportService = new KnowledgeImportService();
