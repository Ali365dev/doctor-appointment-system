import "server-only";
import { sendEmail, sendTemporaryPasswordEmail } from "./email.provider";
import { sendWhatsapp, sendTemporaryPasswordWhatsapp } from "./whatsapp.provider";
import type { NotificationMessage, NotificationResult, TemporaryPasswordMessage } from "./types";

export type { NotificationResult, TemporaryPasswordMessage, NotificationMessage } from "./types";

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

/**
 * Generic best-effort notification: tries email then WhatsApp, falling back to
 * a console log if neither provider is configured. Never throws — a missing
 * SMTP/WhatsApp config must never block the booking/payment flow that calls it.
 */
export async function sendNotification(
  recipient: { email?: string | null; phone?: string | null },
  message: NotificationMessage
): Promise<NotificationResult> {
  try {
    if (recipient.email) {
      const sent = await sendEmail(recipient.email, message);
      if (sent) return { sent: true, channel: "email" };
    }
    if (recipient.phone) {
      const sent = await sendWhatsapp(recipient.phone, message);
      if (sent) return { sent: true, channel: "whatsapp" };
    }
  } catch (err) {
    console.warn(`[notifications] Failed to send "${message.subject}":`, err);
    return { sent: false, channel: "console", reason: "Send failed" };
  }

  console.warn(`[notifications] No email/WhatsApp provider configured. "${message.subject}" not sent.`);
  return { sent: false, channel: "console", reason: "No email/WhatsApp provider configured" };
}
