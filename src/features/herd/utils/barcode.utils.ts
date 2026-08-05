export function farmSuffix(farmId: string): string {
  return farmId.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase() || "FARM";
}

export function nextTagCode(farmId: string, existingTags: string[]): string {
  const suffix = farmSuffix(farmId);
  const prefix = `DOE-${suffix}-`;
  const nums = existingTags
    .filter((t) => t.startsWith(prefix))
    .map((t) => parseInt(t.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export function tagToBarcode(tagCode: string): string {
  return tagCode.replace(/-/g, "");
}
