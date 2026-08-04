import type { GoatBatchStatus } from "../constants/goat-batch.constants";
import type { Barn } from "../types/barn.types";
import type { GoatBatch } from "../types/goat-batch.types";

export function getBarnOccupiedQuantity(batches: GoatBatch[], barnId: string): number {
  return batches
    .filter((batch) => batch.barnId === barnId && batch.status === "active")
    .reduce((sum, batch) => sum + batch.quantity, 0);
}

export function getBarnRemainingCapacity(
  barn: Barn | undefined,
  occupied: number,
): number | null {
  if (!barn?.capacity) return null;
  return Math.max(barn.capacity - occupied, 0);
}

export function formatBarnCapacityHint(
  barn: Barn | undefined,
  occupied: number,
): string | null {
  if (!barn?.capacity) {
    return "Chưa cập nhật sức chứa — không giới hạn số lượng";
  }
  const remaining = getBarnRemainingCapacity(barn, occupied)!;
  return `Sức chứa: ${barn.capacity} con · Đang nuôi: ${occupied} · Còn trống: ${remaining}`;
}

export function validateBatchQuantity(params: {
  quantity: number;
  barn: Barn | undefined;
  occupied: number;
  status?: GoatBatchStatus;
}): string | null {
  const { quantity, barn, occupied, status = "active" } = params;
  if (status !== "active") return null;
  if (!barn?.capacity) return null;

  const remaining = getBarnRemainingCapacity(barn, occupied)!;
  if (quantity > remaining) {
    return `Vượt sức chứa chuồng: còn trống ${remaining}/${barn.capacity} con, bạn nhập ${quantity} con.`;
  }
  return null;
}
