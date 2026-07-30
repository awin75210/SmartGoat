import { z } from "zod";

export const createFarmSchema = z.object({
  name: z.string().trim().min(2, "Tên trại tối thiểu 2 ký tự").max(120),
  location: z.string().trim().min(2, "Khu vực tối thiểu 2 ký tự").max(120),
  ownerFullName: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự").max(120),
  ownerEmail: z.string().trim().email("Email không hợp lệ"),
  ownerPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(64),
  goatCount: z.coerce.number().int().min(0).max(10000).optional(),
});

export type CreateFarmSchemaInput = z.infer<typeof createFarmSchema>;
