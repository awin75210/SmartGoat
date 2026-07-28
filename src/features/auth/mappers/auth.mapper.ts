import type { AuthUser, AuthUserRow } from "../types/auth.types";

export function mapAuthUserRowToDomain(row: AuthUserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    farmId: row.farm_id,
  };
}
