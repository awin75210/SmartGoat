import type { EmailNotifyKey, EmailNotifyRepository } from "./email-notify.repository";

type NotifyRecord = {
  lastSentAt: string;
};

const store = new Map<string, NotifyRecord>();

function keyOf(farmId: string, notifyKey: EmailNotifyKey): string {
  return `${farmId}:${notifyKey}`;
}

export class SeedEmailNotifyRepository implements EmailNotifyRepository {
  async canSend(farmId: string, notifyKey: EmailNotifyKey, cooldownMinutes: number): Promise<boolean> {
    if (notifyKey === "test" || notifyKey === "settings_saved") {
      return true;
    }

    const record = store.get(keyOf(farmId, notifyKey));
    if (!record) return true;

    const elapsedMs = Date.now() - new Date(record.lastSentAt).getTime();
    return elapsedMs >= cooldownMinutes * 60_000;
  }

  async markSent(farmId: string, notifyKey: EmailNotifyKey): Promise<void> {
    store.set(keyOf(farmId, notifyKey), { lastSentAt: new Date().toISOString() });
  }
}
