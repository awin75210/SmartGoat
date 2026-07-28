import type { UserRole } from "@/shared/types/roles";

export type AuthUserRow = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  farm_id: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  farmId: string | null;
};

export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};
