import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  createGoatBatchFormSchema,
  type GoatBatchFormValues,
} from "../schemas/goat-batch.schema";
import type { Barn } from "../types/barn.types";
import type { GoatBatch } from "../types/goat-batch.types";

export const defaultGoatBatchFormValues: GoatBatchFormValues = {
  name: "",
  barn_id: "",
  breed: "",
  gender: "mixed",
  birth_date: null,
  quantity: 1,
  source: "born_on_farm",
  status: "active",
  notes: "",
};

export function useGoatBatchForm(
  barns: Barn[] = [],
  batches: GoatBatch[] = [],
  defaults?: Partial<GoatBatchFormValues>,
) {
  const schema = useMemo(
    () => createGoatBatchFormSchema({ barns, batches }),
    [barns, batches],
  );

  return useForm<GoatBatchFormValues>({
    defaultValues: { ...defaultGoatBatchFormValues, ...defaults },
    resolver: zodResolver(schema),
    mode: "onBlur",
  });
}
