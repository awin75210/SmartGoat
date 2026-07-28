import { SeedIotRepository } from "./seed-iot.repository";
import type { IotRepository } from "./iot.repository";

export function createIotRepository(): IotRepository {
  return new SeedIotRepository();
}
