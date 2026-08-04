import { useMemo } from "react";
import { formatAgeVi } from "../utils/age.utils";

export function useGoatBatchAge(birthDate: Date | null | undefined): string {
  return useMemo(() => formatAgeVi(birthDate ?? null), [birthDate]);
}
