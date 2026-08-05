export const DEVELOPMENT_STAGES = [
  "newborn",
  "weaning",
  "grower",
  "finisher",
  "breeder",
] as const;

export type DevelopmentStage = (typeof DEVELOPMENT_STAGES)[number];

export const DEVELOPMENT_STAGE_LABELS: Record<DevelopmentStage, string> = {
  newborn: "Sơ sinh (0–30 ngày)",
  weaning: "Cai sữa (30–90 ngày)",
  grower: "Tăng trưởng (90–180 ngày)",
  finisher: "Vỗ béo (180+ ngày)",
  breeder: "Sinh sản",
};

/** Age thresholds in days for auto stage */
export const STAGE_AGE_THRESHOLDS = {
  weaning: 30,
  grower: 90,
  finisher: 180,
} as const;

export const GESTATION_DAYS = 150;
