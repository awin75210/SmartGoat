import type { Goat, GoatRow } from "../types/herd.types";

export function mapGoatRowToDomain(row: GoatRow): Goat {
  return {
    id: row.id,
    farmId: row.farm_id,
    tagCode: row.tag_code,
    name: row.name,
    breed: row.breed,
    gender: row.gender,
    birthDate: row.birth_date,
    weightKg: row.weight_kg,
    healthStatus: row.health_status,
    barnId: row.barn_id,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}
