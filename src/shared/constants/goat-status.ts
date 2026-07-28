export type GoatHealthStatus = "healthy" | "monitoring" | "sick" | "recovering";
export type GoatGender = "male" | "female";

export const GOAT_HEALTH_LABELS: Record<GoatHealthStatus, string> = {
  healthy: "Khỏe mạnh",
  monitoring: "Theo dõi",
  sick: "Bệnh",
  recovering: "Hồi phục",
};

export const GOAT_GENDER_LABELS: Record<GoatGender, string> = {
  male: "Đực",
  female: "Cái",
};

export const GOAT_HEALTH_COLORS: Record<GoatHealthStatus, string> = {
  healthy: "#40c057",
  monitoring: "#fab005",
  sick: "#e8590c",
  recovering: "#228be6",
};
