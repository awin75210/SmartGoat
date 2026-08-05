import dayjs from "dayjs";
import type { GrowthRecord } from "../types/growth.types";

export type GrowthProjection = {
  adgKgPerDay: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number;
  estimatedMarketDate: string | null;
  daysRemaining: number | null;
  feedRatioPct: number | null;
  feedRatioWarning: string | null;
};

export function computeAdg(records: GrowthRecord[]): number | null {
  if (records.length < 2) return null;
  const sorted = [...records].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const days = dayjs(last.recordedAt).diff(dayjs(first.recordedAt), "day");
  if (days <= 0) return null;
  return (last.avgWeightKg - first.avgWeightKg) / days;
}

export function computeGrowthProjection(
  records: GrowthRecord[],
  targetWeightKg: number,
  headcount: number,
): GrowthProjection {
  const sorted = [...records].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
  const latest = sorted[0];
  const adg = computeAdg(records);
  const currentWeightKg = latest?.avgWeightKg ?? null;

  let estimatedMarketDate: string | null = null;
  let daysRemaining: number | null = null;
  if (adg !== null && adg > 0 && currentWeightKg !== null && currentWeightKg < targetWeightKg) {
    daysRemaining = Math.ceil((targetWeightKg - currentWeightKg) / adg);
    estimatedMarketDate = dayjs().add(daysRemaining, "day").format("YYYY-MM-DD");
  }

  let feedRatioPct: number | null = null;
  let feedRatioWarning: string | null = null;
  if (latest?.feedKgPerDay && currentWeightKg && headcount > 0) {
    const totalBw = currentWeightKg * headcount;
    feedRatioPct = (latest.feedKgPerDay / totalBw) * 100;
    if (feedRatioPct < 2) {
      feedRatioWarning = "Khẩu phần thấp hơn khuyến nghị (2–3% trọng lượng/ngày)";
    } else if (feedRatioPct > 3.5) {
      feedRatioWarning = "Khẩu phần cao hơn khuyến nghị (2–3% trọng lượng/ngày)";
    }
  }

  return {
    adgKgPerDay: adg,
    currentWeightKg,
    targetWeightKg,
    estimatedMarketDate,
    daysRemaining,
    feedRatioPct,
    feedRatioWarning,
  };
}
