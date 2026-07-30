export type HandbookCategory =
  | "farming_technique"
  | "nutrition"
  | "common_diseases"
  | "kid_care_stages";

export type HandbookArticleRow = {
  id: string;
  farm_id: string | null;
  category: HandbookCategory;
  title: string;
  summary: string;
  body: string;
  tags: string;
  updated_at: string;
};

export type HandbookArticle = {
  id: string;
  category: HandbookCategory;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

export type HandbookCategoryMeta = {
  label: string;
  color: "capraBlue" | "teal" | "orange" | "grape";
  accent: string;
};

export const HANDBOOK_CATEGORY_META: Record<HandbookCategory, HandbookCategoryMeta> = {
  farming_technique: {
    label: "Kỹ thuật chăn nuôi dê",
    color: "capraBlue",
    accent: "#2382f6",
  },
  nutrition: {
    label: "Hướng dẫn dinh dưỡng",
    color: "teal",
    accent: "#12b886",
  },
  common_diseases: {
    label: "Tra cứu bệnh thường gặp",
    color: "orange",
    accent: "#f76707",
  },
  kid_care_stages: {
    label: "Chăm sóc dê con theo từng giai đoạn",
    color: "grape",
    accent: "#7950f2",
  },
};

export const HANDBOOK_CATEGORY_LABELS: Record<HandbookCategory, string> = {
  farming_technique: HANDBOOK_CATEGORY_META.farming_technique.label,
  nutrition: HANDBOOK_CATEGORY_META.nutrition.label,
  common_diseases: HANDBOOK_CATEGORY_META.common_diseases.label,
  kid_care_stages: HANDBOOK_CATEGORY_META.kid_care_stages.label,
};

export const HANDBOOK_CATEGORIES: HandbookCategory[] = [
  "farming_technique",
  "nutrition",
  "common_diseases",
  "kid_care_stages",
];
