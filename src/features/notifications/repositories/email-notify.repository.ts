export type EmailNotifyKey =
  | "settings_saved"
  | "test"
  | "temperature_high"
  | "ammonia_high";

export interface EmailNotifyRepository {
  canSend(farmId: string, notifyKey: EmailNotifyKey, cooldownMinutes: number): Promise<boolean>;
  markSent(farmId: string, notifyKey: EmailNotifyKey): Promise<void>;
}
