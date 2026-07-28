import { SeedUserRepository } from "./seed-user.repository";
import type { UserRepository } from "./user.repository";

export function createUserRepository(): UserRepository {
  return new SeedUserRepository();
}
