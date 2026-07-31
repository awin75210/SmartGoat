import { getEmailFromAddress, getResendApiKey } from "./env";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return {
      ok: false,
      error: "Chưa cấu hình RESEND_API_KEY trong .env.local",
    };
  }

  const to = input.to.trim();
  if (!to) {
    return { ok: false, error: "Thiếu địa chỉ email nhận" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getEmailFromAddress(),
        to: [to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: body.message ?? `Resend HTTP ${res.status}`,
      };
    }

    return { ok: true, id: body.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gửi email thất bại",
    };
  }
}
