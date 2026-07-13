export interface TemporaryPasswordMessage {
  name: string;
  temporaryPassword: string;
}

export interface NotificationResult {
  sent: boolean;
  channel: "email" | "whatsapp" | "console";
  reason?: string;
}

/** A generic message body — a provider renders it however fits that channel. */
export interface NotificationMessage {
  subject: string;
  text: string;
  html?: string;
}
