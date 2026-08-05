export const BREEDING_DOE_STATUSES = [
  "active",
  "pregnant",
  "lactating",
  "retired",
  "sold",
] as const;

export type BreedingDoeStatus = (typeof BREEDING_DOE_STATUSES)[number];

export const BREEDING_DOE_STATUS_LABELS: Record<BreedingDoeStatus, string> = {
  active: "Đang nuôi",
  pregnant: "Đang mang thai",
  lactating: "Đang cho con bú",
  retired: "Nghỉ sinh sản",
  sold: "Đã bán",
};

export const REPRODUCTIVE_CYCLE_STATUSES = [
  "planned",
  "pregnant",
  "kidded",
  "failed",
] as const;

export type ReproductiveCycleStatus = (typeof REPRODUCTIVE_CYCLE_STATUSES)[number];

export const REPRODUCTIVE_CYCLE_STATUS_LABELS: Record<ReproductiveCycleStatus, string> = {
  planned: "Dự kiến",
  pregnant: "Đang mang thai",
  kidded: "Đã đẻ",
  failed: "Không thành công",
};
