export type UserRole = "admin" | "farm_owner";

export type SessionUser = {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  farmId: string | null;
};
