import { z } from "zod";

export const iotTimeRangeSchema = z.enum(["24h", "7d", "30d"]);

export type IotTimeRangeInput = z.infer<typeof iotTimeRangeSchema>;
