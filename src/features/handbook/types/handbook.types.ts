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

export const HANDBOOK_CATEGORY_LABELS: Record<HandbookCategory, string> = {
  farming_technique: "Kỹ thuật chăn nuôi dê",
  nutrition: "Hướng dẫn dinh dưỡng",
  common_diseases: "Tra cứu bệnh thường gặp",
  kid_care_stages: "Chăm sóc dê con theo từng giai đoạn",
};
