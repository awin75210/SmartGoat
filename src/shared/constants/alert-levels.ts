export type AlertLevel = "low" | "medium" | "high";

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};

export const ALERT_LEVEL_COLORS: Record<AlertLevel, string> = {
  low: "#228be6",
  medium: "#fab005",
  high: "#e8590c",
};

export const ALERT_LEVEL_MANTINE: Record<AlertLevel, "blue" | "yellow" | "orange"> = {
  low: "blue",
  medium: "yellow",
  high: "orange",
};
