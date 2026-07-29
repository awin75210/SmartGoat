import { AppError } from "@/lib/errors/app-error";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signInWithSupabase } from "@/lib/auth/supabase-auth";
import { createAuthRepository } from "../repositories/create-auth.repository";
import type { AuthUser, LoginInput } from "../types/auth.types";

export class AuthService {
  private readonly repo = createAuthRepository();

  async login(input: LoginInput): Promise<AuthUser> {
    if (isSupabaseConfigured()) {
      const session = await signInWithSupabase(input);
      return {
        id: session.userId,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
        farmId: session.farmId,
      };
    }

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
