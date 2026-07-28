export type HandbookCategory =
  | "nutrition"
  | "health"
  | "housing"
  | "breeding"
  | "biosecurity";

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
  nutrition: "Dinh dưỡng",
  health: "Sức khỏe",
  housing: "Chuồng trại",
  breeding: "Sinh sản",
  biosecurity: "An toàn sinh học",
};
