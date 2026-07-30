import { adminUsersStore } from "../data/admin.store";
import { mapAdminUserRowToDomain } from "../mappers/admin.mapper";
import type { CreateAdminUserInput } from "./user.repository";
import type { UserRepository } from "./user.repository";

export class SeedUserRepository implements UserRepository {
  async listUsers() {
    return adminUsersStore.map(mapAdminUserRowToDomain);
  }

  async findByEmail(email: string) {
    const row = adminUsersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return row ? mapAdminUserRowToDomain(row) : null;
  }

  async createFarmOwner(input: CreateAdminUserInput) {
    const row = {
      id: input.id,
      email: input.email,
      full_name: input.fullName,
      role: "farm_owner" as const,
      farm_id: input.farmId,
      is_active: true,
    };
    adminUsersStore.push(row);
    return mapAdminUserRowToDomain(row);
  }

  async removeUsersByFarmId(farmId: string) {
    for (let i = adminUsersStore.length - 1; i >= 0; i -= 1) {
      if (adminUsersStore[i]?.farm_id === farmId) {
        adminUsersStore.splice(i, 1);
      }
    }
  }
}
