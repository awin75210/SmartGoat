import type { GoatGender, GoatHealthStatus } from "@/shared/constants/goat-status";

export type GoatRow = {
  id: string;
  farm_id: string;
  tag_code: string;
  name: string;
  breed: string;
  gender: GoatGender;
  birth_date: string;
  weight_kg: number;
  health_status: GoatHealthStatus;
  barn_id: string;
  notes: string | null;
  updated_at: string;
};

export type Goat = {
  id: string;
  farmId: string;
  tagCode: string;
  name: string;
  breed: string;
  gender: GoatGender;
  birthDate: string;
  weightKg: number;
  healthStatus: GoatHealthStatus;
  barnId: string;
  notes: string | null;
  updatedAt: string;
};

export type HerdOverviewStats = {
  totalGoats: number;
  maleCount: number;
  femaleCount: number;
  kidCount: number;
  pregnantCount: number;
  healthyCount: number;
  monitoringCount: number;
  needsCareCount: number;
};

export type HerdListFilter = {
  gender?: GoatGender | "all";
  healthStatus?: GoatHealthStatus | "all";
  search?: string;
};
