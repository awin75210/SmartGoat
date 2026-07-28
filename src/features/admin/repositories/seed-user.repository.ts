import { ADMIN_USERS_SEED } from "../data/admin.seed";
import { mapAdminUserRowToDomain } from "../mappers/admin.mapper";
import type { UserRepository } from "./user.repository";

export class SeedUserRepository implements UserRepository {
  async listUsers() {
    return ADMIN_USERS_SEED.map(mapAdminUserRowToDomain);
  }
}
