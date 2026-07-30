import { authUsersStore } from "../data/auth.store";
import { mapAuthUserRowToDomain } from "../mappers/auth.mapper";
import type { AuthRepository } from "./auth.repository";
import type { AuthUser, LoginInput } from "../types/auth.types";

export class SeedAuthRepository implements AuthRepository {
  async findUserByEmail(email: string): Promise<AuthUser | null> {
    const row = authUsersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return row ? mapAuthUserRowToDomain(row) : null;
  }

  async findUserById(userId: string): Promise<AuthUser | null> {
    const row = authUsersStore.find((u) => u.id === userId);
    return row ? mapAuthUserRowToDomain(row) : null;
  }

  async validateCredentials(input: LoginInput): Promise<AuthUser | null> {
    const row = authUsersStore.find(
      (u) =>
        u.email.toLowerCase() === input.email.toLowerCase() &&
        u.password_hash === input.password,
    );
    return row ? mapAuthUserRowToDomain(row) : null;
  }
}

export function registerAuthUser(input: {
  id: string;
  email: string;
  password: string;
  fullName: string;
  farmId: string;
}): void {
  authUsersStore.push({
    id: input.id,
    email: input.email,
    password_hash: input.password,
    full_name: input.fullName,
    role: "farm_owner",
    farm_id: input.farmId,
  });
}

export function removeAuthUsersByFarmId(farmId: string): void {
  for (let i = authUsersStore.length - 1; i >= 0; i -= 1) {
    if (authUsersStore[i]?.farm_id === farmId) {
      authUsersStore.splice(i, 1);
    }
  }
}
