import { AppError } from "@/lib/errors/app-error";
import { ALERTS_SEED } from "../data/alerts.seed";
import { mapAlertRowToDomain } from "../mappers/alert.mapper";
import type { AlertListFilter } from "../types/alert.types";
import type { AlertRepository } from "./alert.repository";

const resolvedOverrides = new Map<string, string>();

export class SeedAlertRepository implements AlertRepository {
  private resolveState(alertId: string, seedResolved: string | null): string | null {
    if (resolvedOverrides.has(alertId)) {
      return resolvedOverrides.get(alertId) ?? null;
    }
    return seedResolved;
  }

  async listAlerts(farmId: string, filter?: AlertListFilter) {
    let rows = ALERTS_SEED.filter((r) => r.farm_id === farmId).map((row) =>
      mapAlertRowToDomain(row, this.resolveState(row.id, row.resolved_at)),
    );

    if (filter?.level && filter.level !== "all") {
      rows = rows.filter((a) => a.level === filter.level);
    }

    if (filter?.tab === "active") {
      rows = rows.filter((a) => !a.isResolved);
    } else if (filter?.tab === "resolved") {
      rows = rows.filter((a) => a.isResolved);
    }

    return rows.sort(
      (a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime(),
    );
  }

  async getAlertById(farmId: string, alertId: string) {
    const row = ALERTS_SEED.find((r) => r.farm_id === farmId && r.id === alertId);
    if (!row) {
      return null;
    }
    return mapAlertRowToDomain(row, this.resolveState(row.id, row.resolved_at));
  }

  async markResolved(farmId: string, alertId: string, resolvedAt: string) {
    const row = ALERTS_SEED.find((r) => r.farm_id === farmId && r.id === alertId);
    if (!row) {
      throw new AppError("NOT_FOUND");
    }
    resolvedOverrides.set(alertId, resolvedAt);
    return mapAlertRowToDomain(row, resolvedAt);
  }
}
