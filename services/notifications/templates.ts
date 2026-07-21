import { APP_NAME } from "@/lib/constants";

const NAVY = "#0A2447";
const NAVY_LIGHT = "#183C69";
const TEXT_DARK = "#181C26";
const TEXT_MUTED = "#6E7282";
const BORDER = "#E2E6EE";
const ROW_ALT = "#F4F7FA";

function appUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export interface EmailDetailRow {
  label: string;
  value: string;
}

export interface EmailLayoutParams {
  heading: string;
  intro: string;
  rows: EmailDetailRow[];
  ctaLabel?: string;
  ctaUrl?: string;
  note?: string;
}

/**
 * Shared branded HTML shell (navy header to match the PDF letterhead in
 * lib/pdf/letterhead.ts) used by every transactional email — table-based
 * layout with inline styles since most email clients strip <style> blocks.
 */
export function renderEmailLayout({ heading, intro, rows, ctaLabel, ctaUrl, note }: EmailLayoutParams): string {
  const detailRows = rows
    .map(
      (row, i) => `
        <tr style="background:${i % 2 === 1 ? ROW_ALT : "#ffffff"};">
          <td style="padding:10px 16px;font-size:13px;color:${TEXT_MUTED};font-family:Arial,Helvetica,sans-serif;white-space:nowrap;">${row.label}</td>
          <td style="padding:10px 16px;font-size:13px;color:${TEXT_DARK};font-family:Arial,Helvetica,sans-serif;font-weight:bold;text-align:right;">${row.value}</td>
        </tr>`
    )
    .join("");

  const cta =
    ctaLabel && ctaUrl
      ? `
        <tr>
          <td align="center" style="padding:28px 24px 8px;">
            <a href="${ctaUrl}" style="background:${NAVY};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;padding:13px 28px;border-radius:8px;display:inline-block;">
              ${ctaLabel}
            </a>
          </td>
        </tr>`
      : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#EEF1F6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F6;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
            <tr>
              <td style="background:${NAVY};background-image:linear-gradient(120deg, ${NAVY} 60%, ${NAVY_LIGHT} 100%);padding:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px;">
                      <div style="width:34px;height:34px;border-radius:50%;background:#ffffff;color:${NAVY};font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:13px;text-align:center;line-height:34px;">
                        ${APP_NAME.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
                      </div>
                    </td>
                    <td style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;padding-left:8px;">
                      <div style="font-size:15px;font-weight:bold;">${APP_NAME}</div>
                      <div style="font-size:11px;opacity:0.8;">Appointment Notification</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 4px;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:18px;font-weight:bold;color:${TEXT_DARK};margin-bottom:8px;">${heading}</div>
                <div style="font-size:14px;color:${TEXT_MUTED};line-height:1.6;">${intro}</div>
              </td>
            </tr>
            ${
              rows.length > 0
                ? `<tr>
              <td style="padding:20px 24px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
                  ${detailRows}
                </table>
              </td>
            </tr>`
                : ""
            }
            ${cta}
            <tr>
              <td style="padding:20px 24px 28px;font-family:Arial,Helvetica,sans-serif;">
                ${note ? `<div style="font-size:12px;color:${TEXT_MUTED};line-height:1.6;">${note}</div>` : ""}
                <div style="border-top:1px solid ${BORDER};margin-top:16px;padding-top:16px;font-size:11px;color:${TEXT_MUTED};">
                  This is an automated message from ${APP_NAME}'s appointment system. Please do not reply directly to this email.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface BookingConfirmationParams {
  patientName: string;
  appointmentNumber: string;
  appointmentId: string;
  clinicName: string;
  procedureName?: string;
  date: string;
  time: string;
  feePkr: number;
}

export function bookingConfirmationEmail(params: BookingConfirmationParams): { subject: string; text: string; html: string } {
  const subject = "Booking Confirmation";
  const text = `Hi ${params.patientName}, your ${params.procedureName ?? "consultation"} appointment (${params.appointmentNumber}) on ${params.date} at ${params.time} has been booked. We'll notify you once your payment is confirmed. View/download your appointment: ${appUrl(`/book-appointment/success?appointmentId=${params.appointmentId}`)}`;
  const html = renderEmailLayout({
    heading: `Hi ${params.patientName}, your appointment is booked`,
    intro: "We've received your booking request. You'll get another email as soon as your payment is confirmed.",
    rows: [
      { label: "Reference", value: params.appointmentNumber },
      { label: "Clinic", value: params.clinicName },
      ...(params.procedureName ? [{ label: "Procedure", value: params.procedureName }] : []),
      { label: "Date", value: params.date },
      { label: "Time", value: params.time },
      { label: "Fee", value: `PKR ${params.feePkr.toLocaleString()}` },
    ],
    ctaLabel: "View & Download Appointment",
    ctaUrl: appUrl(`/book-appointment/success?appointmentId=${params.appointmentId}`),
    note: "You can download a PDF copy of your appointment details from the link above at any time.",
  });
  return { subject, text, html };
}

export interface AppointmentConfirmedParams {
  patientName: string;
  appointmentNumber: string;
  appointmentId: string;
  date: string;
  time: string;
}

/** Sent for every path that flips an appointment to "confirmed" — payment verified, pay-at-reception, or an admin manually confirming it. */
export function appointmentConfirmedEmail(params: AppointmentConfirmedParams): { subject: string; text: string; html: string } {
  const subject = "Appointment Confirmed";
  const text = `Hi ${params.patientName}, your appointment ${params.appointmentNumber} on ${params.date} at ${params.time} is now confirmed. View/download your appointment: ${appUrl(`/book-appointment/success?appointmentId=${params.appointmentId}`)}`;
  const html = renderEmailLayout({
    heading: `Hi ${params.patientName}, your appointment is confirmed`,
    intro: "Your appointment is confirmed. We look forward to seeing you.",
    rows: [
      { label: "Reference", value: params.appointmentNumber },
      { label: "Date", value: params.date },
      { label: "Time", value: params.time },
      { label: "Status", value: "Confirmed" },
    ],
    ctaLabel: "View & Download Appointment",
    ctaUrl: appUrl(`/book-appointment/success?appointmentId=${params.appointmentId}`),
    note: "Please bring a downloaded or printed copy of your appointment to the clinic.",
  });
  return { subject, text, html };
}

export interface WelcomeEmailParams {
  patientName: string;
}

export function welcomeEmail(params: WelcomeEmailParams): { subject: string; text: string; html: string } {
  const subject = `Welcome to ${APP_NAME}`;
  const text = `Hi ${params.patientName}, welcome to ${APP_NAME}! Your account has been created. You can now book appointments online at ${appUrl("/appointment")}.`;
  const html = renderEmailLayout({
    heading: `Welcome, ${params.patientName}!`,
    intro: `Your account with ${APP_NAME} has been created successfully. You can now book appointments, track your visits, and manage your medical records online.`,
    rows: [],
    ctaLabel: "Book an Appointment",
    ctaUrl: appUrl("/appointment"),
  });
  return { subject, text, html };
}

export interface CancellationParams {
  patientName: string;
  appointmentNumber: string;
  date: string;
  time: string;
  status: "cancelled" | "rejected";
  note?: string;
}

export function cancellationEmail(params: CancellationParams): { subject: string; text: string; html: string } {
  const subject = "Cancellation Notice";
  const text = `Hi ${params.patientName}, your appointment (${params.appointmentNumber}) on ${params.date} at ${params.time} has been ${params.status}.${params.note ? ` Reason: ${params.note}` : ""}`;
  const html = renderEmailLayout({
    heading: `Hi ${params.patientName}, your appointment was ${params.status}`,
    intro: params.note ? `Reason: ${params.note}` : "If you'd like to book a new appointment, you're welcome to do so anytime.",
    rows: [
      { label: "Reference", value: params.appointmentNumber },
      { label: "Date", value: params.date },
      { label: "Time", value: params.time },
      { label: "Status", value: params.status === "cancelled" ? "Cancelled" : "Rejected" },
    ],
  });
  return { subject, text, html };
}
