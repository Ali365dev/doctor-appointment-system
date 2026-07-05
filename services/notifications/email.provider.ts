import "server-only";
import nodemailer from "nodemailer";
import type { TemporaryPasswordMessage } from "./types";

function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendTemporaryPasswordEmail(to: string, message: TemporaryPasswordMessage): Promise<boolean> {
  if (!isEmailConfigured()) {
    return false;
  }

  const transport = getTransport();
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: "Your temporary password",
    text: `Hi ${message.name},\n\nYour temporary password is: ${message.temporaryPassword}\n\nPlease log in and change it immediately.`,
    html: `<p>Hi ${message.name},</p><p>Your temporary password is: <strong>${message.temporaryPassword}</strong></p><p>Please log in and change it immediately.</p>`,
  });

  return true;
}
