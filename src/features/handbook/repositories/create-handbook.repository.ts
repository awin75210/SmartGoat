import { KnowledgeHandbookRepository } from "./knowledge-handbook.repository";
import type { HandbookRepository } from "./handbook.repository";

export function createHandbookRepository(): HandbookRepository {
  return new KnowledgeHandbookRepository();
}
