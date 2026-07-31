import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { EmailNotifyKey, EmailNotifyRepository } from "./email-notify.repository";

export class SupabaseEmailNotifyRepository implements EmailNotifyRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async canSend(farmId: string, notifyKey: EmailNotifyKey, cooldownMinutes: number): Promise<boolean> {
    if (notifyKey === "test" || notifyKey === "settings_saved") {
      return true;
    }

    const supabase = await this.client();
    const { data, error } = await supabase
      .from("farm_email_notify_log")
      .select("last_sent_at")
      .eq("farm_id", farmId)
      .eq("notify_key", notifyKey)
      .maybeSingle();

    if (error) {
      console.warn("[email-notify] canSend lookup failed", error.message);
      return true;
    }

    if (!data?.last_sent_at) return true;

    const elapsedMs = Date.now() - new Date(String(data.last_sent_at)).getTime();
    return elapsedMs >= cooldownMinutes * 60_000;
  }

  async markSent(farmId: string, notifyKey: EmailNotifyKey): Promise<void> {
    const supabase = await this.client();
    const { error } = await supabase.from("farm_email_notify_log").upsert(
      {
        farm_id: farmId,
        notify_key: notifyKey,
        last_sent_at: new Date().toISOString(),
      },
      { onConflict: "farm_id,notify_key" },
    );

    if (error) {
      console.warn("[email-notify] markSent failed", error.message);
    }
  }
}
