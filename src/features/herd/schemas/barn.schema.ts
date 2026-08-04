import { z } from "zod";
import { BARN_STATUSES } from "../constants/goat-batch.constants";

export const createBarnSchema = z.object({
  name: z.string().trim().min(2, "Tên chuồng tối thiểu 2 ký tự").max(120),
  capacity: z
    .number({ error: "Nhập sức chứa hợp lệ" })
    .int("Sức chứa phải là số nguyên")
    .min(1, "Sức chứa tối thiểu 1")
    .max(9999)
    .nullable()
    .optional(),
});

export const updateBarnSchema = createBarnSchema.extend({
  status: z.enum(BARN_STATUSES).optional(),
});

export type CreateBarnSchemaInput = z.infer<typeof createBarnSchema>;
export type UpdateBarnSchemaInput = z.infer<typeof updateBarnSchema>;
