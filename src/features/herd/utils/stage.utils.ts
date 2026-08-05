import dayjs from "dayjs";
import type { DevelopmentStage } from "../constants/development-stage.constants";
import { STAGE_AGE_THRESHOLDS } from "../constants/development-stage.constants";
import { GESTATION_DAYS } from "../constants/development-stage.constants";

export function ageInDaysFromBirth(birthDate: string, reference = new Date()): number {
  const birth = dayjs(birthDate).startOf("day");
  const ref = dayjs(reference).startOf("day");
  return Math.max(0, ref.diff(birth, "day"));
}

export function inferDevelopmentStage(birthDate: string, reference = new Date()): DevelopmentStage {
  const days = ageInDaysFromBirth(birthDate, reference);
  if (days < STAGE_AGE_THRESHOLDS.weaning) return "newborn";
  if (days < STAGE_AGE_THRESHOLDS.grower) return "weaning";
  if (days < STAGE_AGE_THRESHOLDS.finisher) return "grower";
  return "finisher";
}

export function resolveBatchStage(
  birthDate: string,
  storedStage: DevelopmentStage,
  stageOverride: boolean,
): DevelopmentStage {
  if (stageOverride) return storedStage;
  return inferDevelopmentStage(birthDate);
}

export function addDaysToDate(isoDate: string, days: number): string {
  return dayjs(isoDate).add(days, "day").format("YYYY-MM-DD");
}

export function expectedKiddingDate(matingDate: string): string {
  return addDaysToDate(matingDate, GESTATION_DAYS);
}

export function formatDateVi(isoDate: string): string {
  return dayjs(isoDate).format("DD/MM/YYYY");
}
