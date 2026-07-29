import {
  HANDBOOK_CATEGORY_LABELS,
  type HandbookCategory,
} from "@/features/handbook/types/handbook.types";

export const KNOWLEDGE_CATEGORY_SLUGS = [
  "farming_technique",
  "nutrition",
  "common_diseases",
  "kid_care_stages",
] as const satisfies readonly HandbookCategory[];

export type KnowledgeCategorySlug = (typeof KNOWLEDGE_CATEGORY_SLUGS)[number];

const LEGACY_CATEGORY_TO_SLUG: Record<string, KnowledgeCategorySlug> = {
  nutrition: "nutrition",
  health: "common_diseases",
  housing: "farming_technique",
  breeding: "farming_technique",
  biosecurity: "farming_technique",
  farming_technique: "farming_technique",
  common_diseases: "common_diseases",
  kid_care_stages: "kid_care_stages",
};

export function normalizeKnowledgeCategory(raw: string): KnowledgeCategorySlug {
  const trimmed = raw.trim().toLowerCase();
  if (KNOWLEDGE_CATEGORY_SLUGS.includes(trimmed as KnowledgeCategorySlug)) {
    return trimmed as KnowledgeCategorySlug;
  }
  return LEGACY_CATEGORY_TO_SLUG[trimmed] ?? "farming_technique";
}

export function getKnowledgeCategorySelectOptions(): { value: KnowledgeCategorySlug; label: string }[] {
  return KNOWLEDGE_CATEGORY_SLUGS.map((value) => ({
    value,
    label: HANDBOOK_CATEGORY_LABELS[value],
  }));
}

export function getKnowledgeCategoryLabel(slug: string): string {
  const normalized = normalizeKnowledgeCategory(slug);
  return HANDBOOK_CATEGORY_LABELS[normalized];
}
