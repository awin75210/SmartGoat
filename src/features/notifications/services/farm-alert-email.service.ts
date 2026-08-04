import { sendEmail } from "@/lib/email/email.service";
import { getAppBaseUrl, isResendSandboxRecipientError } from "@/lib/email/env";
import { createEmailNotifyRepository } from "../repositories/create-email-notify.repository";
import type { FarmSettings } from "@/features/settings/types/settings.types";
import type { IotMetric } from "@/features/iot-monitoring/types/iot.types";

export type FarmEmailNotifyKey =
  | "settings_saved"
  | "test"
  | "temperature_high"
  | "ammonia_high";

const THRESHOLD_COOLDOWN_MINUTES = 60;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildEmailShell(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a3a5c;max-width:560px">
      <h2 style="color:#1559a2;margin:0 0 12px">${escapeHtml(title)}</h2>
      ${bodyHtml}
      <p style="margin-top:24px;font-size:12px;color:#666">
        CapraCare — hệ thống chăn nuôi dê thông minh<br/>
        <a href="${getAppBaseUrl()}/app/alerts">Xem cảnh báo</a> ·
        <a href="${getAppBaseUrl()}/app/settings">Cài đặt thông báo</a>
      </p>
    </div>
  `.trim();
}

function metricValue(metrics: IotMetric[], key: "temperature" | "ammonia"): number | null {
  const metric = metrics.find((item) => item.metricKey === key);
  return metric ? metric.value : null;
}

export class FarmAlertEmailService {
  private readonly notifyRepo = createEmailNotifyRepository();

  async sendSettingsConfirmation(settings: FarmSettings): Promise<{ sent: boolean; message: string }> {
    if (!settings.notifyEmail) {
      return { sent: false, message: "Chưa bật cảnh báo qua email" };
    }

    const html = buildEmailShell(
      "Đã lưu cài đặt cảnh báo CapraCare",
      `
        <p>Xin chào,</p>
        <p>Cài đặt cảnh báo cho trại <strong>${escapeHtml(settings.farmName)}</strong> đã được lưu.</p>
        <ul>
          <li>Email nhận cảnh báo: <strong>${escapeHtml(settings.alertEmail)}</strong></li>
          <li>Ngưỡng nhiệt độ cao: <strong>${settings.temperatureHighC}°C</strong></li>
          <li>Ngưỡng NH₃ tối đa: <strong>${settings.ammoniaMaxPpm} ppm</strong></li>
        </ul>
        <p>Khi nhiệt độ hoặc NH₃ vượt ngưỡng, CapraCare sẽ gửi email cảnh báo tới địa chỉ trên.</p>
      `,
    );

    const result = await sendEmail({
      to: settings.alertEmail,
      subject: `[CapraCare] Đã bật cảnh báo email — ${settings.farmName}`,
      html,
      text: `CapraCare: cài đặt cảnh báo đã lưu cho ${settings.farmName}. Email nhận: ${settings.alertEmail}.`,
    });

    if (!result.ok) {
      return { sent: false, message: result.error };
    }

    await this.notifyRepo.markSent(settings.farmId, "settings_saved");
    return { sent: true, message: `Đã gửi email xác nhận tới ${settings.alertEmail}` };
  }

  async sendTestAlert(settings: FarmSettings): Promise<{ sent: boolean; message: string }> {
    if (!settings.notifyEmail) {
      return { sent: false, message: "Bật 「Cảnh báo qua email」 trước khi gửi thử" };
    }

    const html = buildEmailShell(
      "Email thử — Cảnh báo CapraCare",
      `
        <p>Đây là email thử từ CapraCare.</p>
        <p>Nếu bạn nhận được thư này, hệ thống đã cấu hình đúng và sẽ gửi cảnh báo thật khi:</p>
        <ul>
          <li>Nhiệt độ chuồng &gt; <strong>${settings.temperatureHighC}°C</strong></li>
          <li>NH₃ &gt; <strong>${settings.ammoniaMaxPpm} ppm</strong></li>
        </ul>
      `,
    );

    const result = await sendEmail({
      to: settings.alertEmail,
      subject: `[CapraCare] Email thử cảnh báo — ${settings.farmName}`,
      html,
      text: "Email thử cảnh báo CapraCare — cấu hình email hoạt động.",
    });

    if (!result.ok) {
      return { sent: false, message: result.error };
    }

    await this.notifyRepo.markSent(settings.farmId, "test");
    return { sent: true, message: `Đã gửi email thử tới ${settings.alertEmail}` };
  }

  private async sendThresholdAlert(params: {
    settings: FarmSettings;
    notifyKey: Extract<FarmEmailNotifyKey, "temperature_high" | "ammonia_high">;
    title: string;
    measured: number;
    threshold: number;
    unit: string;
  }): Promise<boolean> {
    const canSend = await this.notifyRepo.canSend(
      params.settings.farmId,
      params.notifyKey,
      THRESHOLD_COOLDOWN_MINUTES,
    );
    if (!canSend) return false;

    const html = buildEmailShell(
      params.title,
      `
        <p><strong style="color:#c92a2a">Cảnh báo môi trường chuồng</strong></p>
        <p>Trại: <strong>${escapeHtml(params.settings.farmName)}</strong></p>
        <p>Giá trị đo: <strong>${params.measured}${params.unit}</strong></p>
        <p>Ngưỡng cài đặt: <strong>${params.threshold}${params.unit}</strong></p>
        <p>Vui lòng kiểm tra thông gió, độ ẩm và tình trạng đàn dê.</p>
      `,
    );

    const result = await sendEmail({
      to: params.settings.alertEmail,
      subject: `[CapraCare] ${params.title} — ${params.settings.farmName}`,
      html,
      text: `${params.title}: ${params.measured}${params.unit} (ngưỡng ${params.threshold}${params.unit})`,
    });

    if (!result.ok) {
      if (isResendSandboxRecipientError(result.error)) {
        console.warn(
          "[email] threshold alert skipped (Resend sandbox — chỉ gửi được tới email tài khoản Resend):",
          result.error,
        );
      } else {
        console.error("[email] threshold alert failed", result.error);
      }
      return false;
    }

    await this.notifyRepo.markSent(params.settings.farmId, params.notifyKey);
    return true;
  }

  async evaluateMetricThresholds(
    settings: FarmSettings,
    metrics: IotMetric[],
  ): Promise<{ sentCount: number }> {
    if (!settings.notifyEmail) {
      return { sentCount: 0 };
    }

    let sentCount = 0;
    const temperature = metricValue(metrics, "temperature");
    const ammonia = metricValue(metrics, "ammonia");

    if (temperature !== null && temperature > settings.temperatureHighC) {
      const sent = await this.sendThresholdAlert({
        settings,
        notifyKey: "temperature_high",
        title: "Nhiệt độ chuồng vượt ngưỡng",
        measured: temperature,
        threshold: settings.temperatureHighC,
        unit: "°C",
      });
      if (sent) sentCount += 1;
    }

    if (ammonia !== null && ammonia > settings.ammoniaMaxPpm) {
      const sent = await this.sendThresholdAlert({
        settings,
        notifyKey: "ammonia_high",
        title: "NH₃ vượt ngưỡng",
        measured: ammonia,
        threshold: settings.ammoniaMaxPpm,
        unit: " ppm",
      });
      if (sent) sentCount += 1;
    }

    return { sentCount };
  }
}

export const farmAlertEmailService = new FarmAlertEmailService();
