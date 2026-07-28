import { AppError } from "@/lib/errors/app-error";
import { createAuthRepository } from "../repositories/create-auth.repository";
import type { AuthUser, LoginInput } from "../types/auth.types";

export class AuthService {
  private readonly repo = createAuthRepository();

  async login(input: LoginInput): Promise<AuthUser> {
    const user = await this.repo.validateCredentials(input);
    if (!user) {
      throw new AppError("UNAUTHORIZED");
    }
    return user;
  }

  async getUserById(userId: string): Promise<AuthUser> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new AppError("UNAUTHORIZED");
    }
    return user;
  }
}

export const authService = new AuthService();
