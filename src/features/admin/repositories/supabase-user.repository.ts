import { AppError } from "@/lib/errors/app-error";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { mapAdminUserRowToDomain } from "../mappers/admin.mapper";
import type { CreateAdminUserInput, UserRepository } from "./user.repository";
import type { AdminUser } from "../types/admin.types";

export class SupabaseUserRepository implements UserRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async listUsers() {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, farm_id")
      .order("full_name");

    if (error) throw error;

    return (data ?? []).map((row) =>
      mapAdminUserRowToDomain({
        id: String(row.id),
        email: String(row.email ?? ""),
        full_name: String(row.full_name ?? ""),
        role: row.role === "admin" ? "admin" : "farm_owner",
        farm_id: row.farm_id ? String(row.farm_id) : null,
        is_active: true,
      }),
    );
  }

  async findByEmail(email: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, farm_id")
      .ilike("email", email)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapAdminUserRowToDomain({
      id: String(data.id),
      email: String(data.email ?? ""),
      full_name: String(data.full_name ?? ""),
      role: data.role === "admin" ? "admin" : "farm_owner",
      farm_id: data.farm_id ? String(data.farm_id) : null,
      is_active: true,
    });
  }

  async createFarmOwner(input: CreateAdminUserInput): Promise<AdminUser> {
    throw new AppError(
      "INTERNAL_ERROR",
      `Chưa hỗ trợ tạo tài khoản ${input.email} tự động — tạo user trong Supabase Dashboard và gán farm_id.`,
    );
  }

  async removeUsersByFarmId(farmId: string) {
    const supabase = await this.client();
    const { error } = await supabase.from("profiles").update({ farm_id: null }).eq("farm_id", farmId);
    if (error) throw error;
  }
}
