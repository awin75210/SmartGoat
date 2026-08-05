export const JOURNAL_ENTRY_TYPES = [
  "note",
  "vaccination",
  "deworming",
  "feeding",
  "weight",
  "movement",
  "reproduction",
  "health",
] as const;

export type JournalEntryType = (typeof JOURNAL_ENTRY_TYPES)[number];

export const JOURNAL_ENTRY_TYPE_LABELS: Record<JournalEntryType, string> = {
  note: "Ghi chú",
  vaccination: "Tiêm phòng",
  deworming: "Tẩy giun",
  feeding: "Khẩu phần / Cho ăn",
  weight: "Cân nặng",
  movement: "Di chuyển / Xuất nhập",
  reproduction: "Sinh sản",
  health: "Sức khỏe",
};
