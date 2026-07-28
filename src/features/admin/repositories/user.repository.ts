import type { AdminUser } from "../types/admin.types";

export interface UserRepository {
  listUsers(): Promise<AdminUser[]>;
}
