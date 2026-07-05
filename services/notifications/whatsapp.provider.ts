import "server-only";
import type { TemporaryPasswordMessage } from "./types";

function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN);
}

/**
 * Generic webhook-style WhatsApp sender so any provider (Meta Cloud API,
 * Twilio, a self-hosted gateway...) can be plugged in later by pointing
 * WHATSAPP_API_URL at its send-message endpoint — no code change needed
 * here unless the request shape differs.
 */
export async function sendTemporaryPasswordWhatsapp(phone: string, message: TemporaryPasswordMessage): Promise<boolean> {
  if (!isWhatsAppConfigured()) {
    return false;
  }

  const res = await fetch(process.env.WHATSAPP_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
    },
    body: JSON.stringify({
      to: phone,
      text: `Hi ${message.name}, your temporary password is: ${message.temporaryPassword}. Please log in and change it immediately.`,
    }),
  });

  return res.ok;
}
