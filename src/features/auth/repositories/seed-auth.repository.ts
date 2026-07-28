import { AUTH_USERS_SEED } from "../data/auth.seed";
import { mapAuthUserRowToDomain } from "../mappers/auth.mapper";
import type { AuthRepository } from "./auth.repository";
import type { AuthUser, LoginInput } from "../types/auth.types";

export class SeedAuthRepository implements AuthRepository {
  async findUserByEmail(email: string): Promise<AuthUser | null> {
    const row = AUTH_USERS_SEED.find((u) => u.email === email);
    return row ? mapAuthUserRowToDomain(row) : null;
  }

  async findUserById(userId: string): Promise<AuthUser | null> {
    const row = AUTH_USERS_SEED.find((u) => u.id === userId);
    return row ? mapAuthUserRowToDomain(row) : null;
  }

  async validateCredentials(input: LoginInput): Promise<AuthUser | null> {
    const row = AUTH_USERS_SEED.find(
      (u) => u.email === input.email && u.password_hash === input.password,
    );
    return row ? mapAuthUserRowToDomain(row) : null;
  }
}
