import { z } from "zod";

export const updateSettingsSchema = z.object({
  farmName: z
    .string()
    .trim()
    .min(2, "Tên trại phải có ít nhất 2 ký tự")
    .max(120, "Tên trại quá dài"),
  timezone: z.string().trim().min(1, "Chọn múi giờ"),
  alertEmail: z.string().trim().email("Email nhận cảnh báo không hợp lệ"),
  notifyPush: z.boolean(),
  notifyEmail: z.boolean(),
  temperatureHighC: z.coerce
    .number({ error: "Nhập ngưỡng nhiệt độ hợp lệ" })
    .min(15, "Tối thiểu 15°C")
    .max(45, "Tối đa 45°C"),
  ammoniaMaxPpm: z.coerce
    .number({ error: "Nhập ngưỡng NH₃ hợp lệ" })
    .min(1, "Tối thiểu 1 ppm")
    .max(50, "Tối đa 50 ppm"),
});

export type UpdateSettingsSchemaInput = z.infer<typeof updateSettingsSchema>;
