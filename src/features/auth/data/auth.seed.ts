import type { AuthUserRow } from "../types/auth.types";

/** Seed passwords are plain text for demo only — replace with hashed values when using Supabase. */
export const AUTH_USERS_SEED: AuthUserRow[] = [
  {
    id: "user-owner-001",
    email: "owner@capracare.vn",
    password_hash: "123456",
    full_name: "Nguyễn Văn Trang",
    role: "farm_owner",
    farm_id: "farm-capracare-001",
  },
  {
    id: "user-admin-001",
    email: "admin@capracare.vn",
    password_hash: "123456",
    full_name: "Quản trị CapraCare",
    role: "admin",
    farm_id: null,
  },
];
