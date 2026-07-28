import { SeedAlertRepository } from "./seed-alert.repository";
import type { AlertRepository } from "./alert.repository";

export function createAlertRepository(): AlertRepository {
  return new SeedAlertRepository();
}
