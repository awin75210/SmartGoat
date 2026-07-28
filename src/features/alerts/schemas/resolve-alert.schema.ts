import { z } from "zod";

export const resolveAlertSchema = z.object({
  alertId: z.string().min(1),
});

export type ResolveAlertInput = z.infer<typeof resolveAlertSchema>;
