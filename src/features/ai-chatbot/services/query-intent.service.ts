const IOT_KEYWORDS = [
  "iot",
  "cảm biến",
  "sensor",
  "nhiệt độ",
  "độ ẩm",
  "nh3",
  "amoniac",
  "ammonia",
  "môi trường",
  "chuồng",
  "thông gió",
  "ánh sáng",
];

const HERD_KEYWORDS = [
  "đàn",
  "dê",
  "con dê",
  "dê con",
  "sức khỏe",
  "bệnh",
  "tiêu chảy",
  "mang thai",
  "đẻ",
  "cái",
  "đực",
  "herd",
];

const HEALTH_KEYWORDS = [
  "bệnh",
  "triệu chứng",
  "tiêu chảy",
  "phân lỏng",
  "sốt",
  "ho",
  "thú y",
  "viêm",
  "nhiễm",
  "bọn",
  "nấm",
  "ký sinh trùng",
  "ky sinh trung",
  "bị gì",
  "là bệnh gì",
  "benh gi",
  "chán ăn",
  "bỏ ăn",
  "mũi chảy",
  "thở nhanh",
  "đau",
];

const NUTRITION_KEYWORDS = [
  "dinh dưỡng",
  "khẩu phần",
  "thức ăn",
  "cỏ",
  "khoáng",
  "sữa",
  "ăn",
  "uống",
  "nutrition",
];

export type QueryIntent = {
  needsIot: boolean;
  needsHerd: boolean;
  isHealthRelated: boolean;
  isNutritionRelated: boolean;
};

export function detectQueryIntent(question: string): QueryIntent {
  const lower = question.toLowerCase();
  const needsIot = IOT_KEYWORDS.some((kw) => lower.includes(kw));
  const needsHerd = HERD_KEYWORDS.some((kw) => lower.includes(kw));
  const isHealthRelated = HEALTH_KEYWORDS.some((kw) => lower.includes(kw));
  const isNutritionRelated = NUTRITION_KEYWORDS.some((kw) => lower.includes(kw));
  return { needsIot, needsHerd, isHealthRelated, isNutritionRelated };
}
