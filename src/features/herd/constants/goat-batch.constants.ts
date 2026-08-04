export const GOAT_BATCH_GENDERS = ["mixed", "male", "female"] as const;
export type GoatBatchGender = (typeof GOAT_BATCH_GENDERS)[number];

export const GOAT_BATCH_GENDER_LABELS: Record<GoatBatchGender, string> = {
  mixed: "Mixed",
  male: "Đực",
  female: "Cái",
};

export const GOAT_BATCH_SOURCES = ["born_on_farm", "purchased", "transferred", "other"] as const;
export type GoatBatchSource = (typeof GOAT_BATCH_SOURCES)[number];

export const GOAT_BATCH_SOURCE_LABELS: Record<GoatBatchSource, string> = {
  born_on_farm: "Sinh tại trại",
  purchased: "Mua",
  transferred: "Nhập từ trại khác",
  other: "Khác",
};

export const GOAT_BATCH_STATUSES = ["active", "sold", "moved_out", "closed"] as const;
export type GoatBatchStatus = (typeof GOAT_BATCH_STATUSES)[number];

export const GOAT_BATCH_STATUS_LABELS: Record<GoatBatchStatus, string> = {
  active: "Đang nuôi",
  sold: "Đã bán",
  moved_out: "Đã xuất chuồng",
  closed: "Đã kết thúc",
};

export const GOAT_BREED_OPTIONS = [
  "Boer",
  "Bách Thảo",
  "Lai Boer",
  "Saanen",
  "Alpine",
  "Khác",
] as const;

export const BATCH_CODE_PATTERN = /^GOAT-\d{6}-\d{3,}$/;

export const BARN_STATUSES = ["active", "inactive"] as const;
export type BarnStatus = (typeof BARN_STATUSES)[number];

export const BARN_STATUS_LABELS: Record<BarnStatus, string> = {
  active: "Hoạt động",
  inactive: "Ngừng sử dụng",
};
