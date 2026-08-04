export function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY?.trim() || undefined;
}

export function getEmailFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "CapraCare <onboarding@resend.dev>"
  );
}

export function isEmailConfigured(): boolean {
  return Boolean(getResendApiKey());
}

export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

/** Resend free tier only delivers to the account owner's inbox until a domain is verified. */
export function isResendSandboxRecipientError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("only send testing emails to your own email address") ||
    lower.includes("verify a domain at resend.com/domains")
  );
}
