import { z } from "zod";

export const updateSettingsSchema = z.object({
  farmName: z.string().min(2).max(120),
  timezone: z.string().min(1),
  alertEmail: z.email(),
  notifyPush: z.boolean(),
  notifySms: z.boolean(),
  temperatureHighC: z.number().min(15).max(45),
  ammoniaMaxPpm: z.number().min(1).max(50),
});

export type UpdateSettingsSchemaInput = z.infer<typeof updateSettingsSchema>;
