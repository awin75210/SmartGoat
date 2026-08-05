export const CARE_TYPES = ["vaccination", "deworming", "feeding", "general_care"] as const;
export type CareType = (typeof CARE_TYPES)[number];

export const CARE_TYPE_LABELS: Record<CareType, string> = {
  vaccination: "Tiêm phòng",
  deworming: "Tẩy giun",
  feeding: "Khẩu phần",
  general_care: "Chăm sóc chung",
};

export const REMINDER_STATUSES = ["pending", "done", "skipped", "overdue"] as const;
export type ReminderStatus = (typeof REMINDER_STATUSES)[number];

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  pending: "Chưa làm",
  done: "Đã hoàn thành",
  skipped: "Bỏ qua",
  overdue: "Quá hạn",
};
