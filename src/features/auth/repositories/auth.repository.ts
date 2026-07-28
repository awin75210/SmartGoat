import type { AuthUser, LoginInput } from "../types/auth.types";

export interface AuthRepository {
  findUserByEmail(email: string): Promise<AuthUser | null>;
  validateCredentials(input: LoginInput): Promise<AuthUser | null>;
  findUserById(userId: string): Promise<AuthUser | null>;
}
