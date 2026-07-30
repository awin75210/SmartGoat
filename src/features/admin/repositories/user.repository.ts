import type { AdminUser } from "../types/admin.types";

export type CreateAdminUserInput = {
  id: string;
  email: string;
  fullName: string;
  farmId: string;
  password: string;
};

export interface UserRepository {
  listUsers(): Promise<AdminUser[]>;
  findByEmail(email: string): Promise<AdminUser | null>;
  createFarmOwner(input: CreateAdminUserInput): Promise<AdminUser>;
  removeUsersByFarmId(farmId: string): Promise<void>;
}
