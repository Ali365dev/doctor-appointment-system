import "server-only";
import { sendTemporaryPasswordEmail } from "./email.provider";
import { sendTemporaryPasswordWhatsapp } from "./whatsapp.provider";
import type { NotificationResult, TemporaryPasswordMessage } from "./types";

export type { NotificationResult, TemporaryPasswordMessage } from "./types";

export async function sendTemporaryPassword(
  recipient: { email?: string | null; phone?: string | null },
  message: TemporaryPasswordMessage
): Promise<NotificationResult> {
  if (recipient.email) {
    const sent = await sendTemporaryPasswordEmail(recipient.email, message);
    if (sent) return { sent: true, channel: "email" };
  }

  if (recipient.phone) {
    const sent = await sendTemporaryPasswordWhatsapp(recipient.phone, message);
    if (sent) return { sent: true, channel: "whatsapp" };
  }

  // No provider configured yet — log so the temp password is still visible
  // during development instead of vanishing silently.
  console.warn(
    `[notifications] No email/WhatsApp provider configured. Temporary password for ${message.name}: ${message.temporaryPassword}`
  );
  return { sent: false, channel: "console", reason: "No email/WhatsApp provider configured" };
}
