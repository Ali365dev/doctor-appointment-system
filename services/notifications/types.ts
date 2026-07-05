export interface TemporaryPasswordMessage {
  name: string;
  temporaryPassword: string;
}

export interface NotificationResult {
  sent: boolean;
  channel: "email" | "whatsapp" | "console";
  reason?: string;
}
