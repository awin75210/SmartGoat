import { BATCH_CODE_PATTERN } from "../constants/goat-batch.constants";

/** Period key YYYYMM from current date */
export function currentBatchCodePeriod(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
}

export function buildBatchCode(period: string, sequence: number): string {
  const seq = String(sequence).padStart(3, "0");
  return `GOAT-${period}-${seq}`;
}

export function parseBatchCodePeriod(batchCode: string): string | null {
  if (!BATCH_CODE_PATTERN.test(batchCode)) return null;
  const parts = batchCode.split("-");
  return parts[1] ?? null;
}

export function parseBatchCodeSequence(batchCode: string): number | null {
  if (!BATCH_CODE_PATTERN.test(batchCode)) return null;
  const parts = batchCode.split("-");
  const seq = Number(parts[2]);
  return Number.isFinite(seq) ? seq : null;
}

/** @deprecated use parseBatchCodePeriod */
export function parseBatchCodeYear(batchCode: string): number | null {
  const period = parseBatchCodePeriod(batchCode);
  if (!period || period.length < 4) return null;
  return Number(period.slice(0, 4));
}

export function nextBatchCode(
  existingCodes: string[],
  period = currentBatchCodePeriod(),
): string {
  const samePeriod = existingCodes.filter((code) => parseBatchCodePeriod(code) === period);
  let maxSeq = 0;
  for (const code of samePeriod) {
    const seq = parseBatchCodeSequence(code);
    if (seq !== null && seq > maxSeq) maxSeq = seq;
  }
  return buildBatchCode(period, maxSeq + 1);
}
