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

const HEALTH_KEYWORDS = ["bệnh", "triệu chứng", "tiêu chảy", "sốt", "ho", "thú y", "viêm", "nhiễm"];

export type QueryIntent = {
  needsIot: boolean;
  needsHerd: boolean;
  isHealthRelated: boolean;
};

export function detectQueryIntent(question: string): QueryIntent {
  const lower = question.toLowerCase();
  const needsIot = IOT_KEYWORDS.some((kw) => lower.includes(kw));
  const needsHerd = HERD_KEYWORDS.some((kw) => lower.includes(kw));
  const isHealthRelated = HEALTH_KEYWORDS.some((kw) => lower.includes(kw));
  return { needsIot, needsHerd, isHealthRelated };
}
