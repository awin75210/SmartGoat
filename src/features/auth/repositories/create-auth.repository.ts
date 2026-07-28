import { SeedAuthRepository } from "./seed-auth.repository";
import type { AuthRepository } from "./auth.repository";

export function createAuthRepository(): AuthRepository {
  return new SeedAuthRepository();
}
