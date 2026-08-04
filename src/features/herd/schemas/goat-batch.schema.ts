import { z } from "zod";
import {
  GOAT_BATCH_GENDERS,
  GOAT_BATCH_SOURCES,
  GOAT_BATCH_STATUSES,
} from "../constants/goat-batch.constants";
import {
  getBarnOccupiedQuantity,
  validateBatchQuantity,
} from "../utils/barn-capacity.utils";
import type { Barn } from "../types/barn.types";
import type { GoatBatch } from "../types/goat-batch.types";

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

const goatBatchFieldsSchema = {
  name: z.string().trim().min(2, "Tên đàn tối thiểu 2 ký tự").max(120),
  barn_id: z.string().trim().min(1, "Chọn chuồng"),
  breed: z.string().trim().min(1, "Chọn hoặc nhập giống"),
  gender: z.enum(GOAT_BATCH_GENDERS),
  birth_date: z.coerce
    .date({ error: "Chọn ngày sinh hợp lệ" })
    .max(endOfToday(), "Không chọn ngày sinh ở tương lai"),
  quantity: z
    .number({ error: "Nhập số lượng hợp lệ" })
    .int("Số lượng phải là số nguyên")
    .min(1, "Số lượng tối thiểu 1"),
  source: z.enum(GOAT_BATCH_SOURCES),
  status: z.enum(GOAT_BATCH_STATUSES).default("active"),
  notes: z.string().trim().max(500).optional().nullable(),
};

/** Server schema — batch_code được gán tự động, không nhận từ client */
export const createGoatBatchSchema = z.object({
  ...goatBatchFieldsSchema,
});

export type CreateGoatBatchSchemaInput = z.infer<typeof createGoatBatchSchema>;

const goatBatchFormBaseSchema = z.object({
  name: goatBatchFieldsSchema.name,
  barn_id: goatBatchFieldsSchema.barn_id,
  breed: goatBatchFieldsSchema.breed,
  gender: goatBatchFieldsSchema.gender,
  birth_date: z.date().nullable(),
  quantity: goatBatchFieldsSchema.quantity,
  source: goatBatchFieldsSchema.source,
  status: z.enum(GOAT_BATCH_STATUSES),
  notes: z.string().trim().max(500),
});

export type GoatBatchFormValues = z.infer<typeof goatBatchFormBaseSchema>;

export type GoatBatchFormContext = {
  barns: Barn[];
  batches: GoatBatch[];
};

/** RHF form schema — birth_date nullable until user picks a date */
export function createGoatBatchFormSchema(context?: GoatBatchFormContext) {
  return goatBatchFormBaseSchema.superRefine((values, ctx) => {
    if (!values.birth_date) {
      ctx.addIssue({ code: "custom", message: "Chọn ngày sinh", path: ["birth_date"] });
    } else if (values.birth_date > endOfToday()) {
      ctx.addIssue({
        code: "custom",
        message: "Không chọn ngày sinh ở tương lai",
        path: ["birth_date"],
      });
    }

    if (!context || !values.barn_id) return;

    const barn = context.barns.find((item) => item.id === values.barn_id);
    const occupied = getBarnOccupiedQuantity(context.batches, values.barn_id);
    const capacityError = validateBatchQuantity({
      quantity: values.quantity,
      barn,
      occupied,
      status: values.status,
    });

    if (capacityError) {
      ctx.addIssue({
        code: "custom",
        message: capacityError,
        path: ["quantity"],
      });
    }
  });
}

/** @deprecated use createGoatBatchFormSchema() */
export const goatBatchFormSchema = createGoatBatchFormSchema();

export function goatBatchFormToPayload(values: GoatBatchFormValues) {
  if (!values.birth_date) {
    throw new Error("birth_date required");
  }
  return createGoatBatchSchema.parse({
    name: values.name,
    barn_id: values.barn_id,
    breed: values.breed,
    gender: values.gender,
    birth_date: values.birth_date,
    quantity: values.quantity,
    source: values.source,
    status: values.status,
    notes: values.notes || null,
  });
}
