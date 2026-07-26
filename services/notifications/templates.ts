import { APP_NAME } from "@/lib/constants";
import { OTP_EXPIRY_MINUTES } from "@/lib/otp";

// Matches the site's "Clinical Precision" theme (app/(public)/globals.css --color-primary etc.)
// and the Reports PDF export's brand color (lib/pdf/letterhead.ts PDF_COLORS).
const NAVY = "#0F766E";
const NAVY_LIGHT = "#0D9488";
const TEXT_DARK = "#1A1C1E";
const TEXT_MUTED = "#6E7282";
const BORDER = "#E2E6EE";
const ROW_ALT = "#F4F7FA";
const PAGE_BG = "#F7F9FB";

export function appUrl(path: string): string {
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
  <body style="margin:0;padding:0;background:${PAGE_BG};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};padding:24px 0;">
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

export interface EmailVerificationOtpParams {
  name: string;
  code: string;
}

export function emailVerificationOtpEmail(params: EmailVerificationOtpParams): { subject: string; text: string; html: string } {
  const subject = "Verify your email";
  const text = `Hi ${params.name}, your email verification code is ${params.code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;
  const html = renderEmailLayout({
    heading: "Verify your email",
    intro: `Hi ${params.name}, use the code below to verify your email address. This code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    rows: [{ label: "Verification Code", value: params.code }],
    note: "If you didn't request this, you can safely ignore this email.",
  });
  return { subject, text, html };
}

export interface PasswordResetOtpParams {
  name: string;
  code: string;
}

export function passwordResetOtpEmail(params: PasswordResetOtpParams): { subject: string; text: string; html: string } {
  const subject = "Reset your password";
  const text = `Hi ${params.name}, your password reset code is ${params.code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;
  const html = renderEmailLayout({
    heading: "Reset your password",
    intro: `Hi ${params.name}, use the code below to reset your password. This code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    rows: [{ label: "Reset Code", value: params.code }],
    note: "If you didn't request this, you can safely ignore this email — your password will remain unchanged.",
  });
  return { subject, text, html };
}

export interface GoogleAccountPasswordParams {
  name: string;
  generatedPassword: string;
}

export function googleAccountPasswordEmail(params: GoogleAccountPasswordParams): { subject: string; text: string; html: string } {
  const subject = "Welcome! Your Account Password";
  const text = `Hi ${params.name}, welcome to ${APP_NAME}! Your account was created using Google Sign-In. We've also generated a password so you can log in with Email & Password in addition to Google: ${params.generatedPassword}. We recommend changing this password from Account Settings after logging in.`;
  const html = renderEmailLayout({
    heading: `Welcome, ${params.name}!`,
    intro: `Your ${APP_NAME} account was created using Google Sign-In. We've generated a password for your account so you can also log in using Email & Password, in addition to Google Sign-In.`,
    rows: [{ label: "Your Password", value: params.generatedPassword }],
    ctaLabel: "Go to Account Settings",
    ctaUrl: appUrl("/patient/settings"),
    note: "For your security, we recommend changing this password from Account Settings after logging in.",
  });
  return { subject, text, html };
}

export interface PasswordChangedParams {
  name: string;
}

export function passwordChangedEmail(params: PasswordChangedParams): { subject: string; text: string; html: string } {
  const subject = "Your password was changed";
  const text = `Hi ${params.name}, this confirms your ${APP_NAME} account password was just changed. If you didn't make this change, please contact support immediately.`;
  const html = renderEmailLayout({
    heading: "Password changed",
    intro: `Hi ${params.name}, this confirms your account password was just changed. If you didn't make this change, please contact support immediately.`,
    rows: [],
  });
  return { subject, text, html };
}

export interface DigestAppointmentRow {
  time: string;
  patientName: string;
  clinicName: string;
  procedureName?: string;
  status: string;
}

export interface DailyAppointmentDigestParams {
  today: string;
  todayAppointments: DigestAppointmentRow[];
  tomorrow: string;
  tomorrowAppointments: DigestAppointmentRow[];
  pdfUrl?: string;
}

function appointmentListTable(rows: DigestAppointmentRow[]): string {
  if (rows.length === 0) {
    return `<div style="padding:14px 16px;font-size:13px;color:${TEXT_MUTED};font-family:Arial,Helvetica,sans-serif;">No appointments scheduled.</div>`;
  }
  const body = rows
    .map(
      (row, i) => `
        <tr style="background:${i % 2 === 1 ? ROW_ALT : "#ffffff"};">
          <td style="padding:8px 12px;font-size:12px;color:${TEXT_DARK};font-family:Arial,Helvetica,sans-serif;white-space:nowrap;">${row.time}</td>
          <td style="padding:8px 12px;font-size:12px;color:${TEXT_DARK};font-family:Arial,Helvetica,sans-serif;font-weight:bold;">${row.patientName}</td>
          <td style="padding:8px 12px;font-size:12px;color:${TEXT_MUTED};font-family:Arial,Helvetica,sans-serif;">${row.procedureName ?? "Consultation"}</td>
          <td style="padding:8px 12px;font-size:12px;color:${TEXT_MUTED};font-family:Arial,Helvetica,sans-serif;">${row.clinicName}</td>
          <td style="padding:8px 12px;font-size:11px;color:${TEXT_MUTED};font-family:Arial,Helvetica,sans-serif;text-align:right;">${row.status}</td>
        </tr>`
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
      <tr style="background:${NAVY_LIGHT};">
        <td style="padding:8px 12px;font-size:11px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-weight:bold;">Time</td>
        <td style="padding:8px 12px;font-size:11px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-weight:bold;">Patient</td>
        <td style="padding:8px 12px;font-size:11px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-weight:bold;">Procedure</td>
        <td style="padding:8px 12px;font-size:11px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-weight:bold;">Clinic</td>
        <td style="padding:8px 12px;font-size:11px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-weight:bold;text-align:right;">Status</td>
      </tr>
      ${body}
    </table>`;
}

/** Daily digest sent to the doctor/admin: today's full list + tomorrow's full list. */
export function dailyAppointmentDigestEmail(params: DailyAppointmentDigestParams): { subject: string; text: string; html: string } {
  const subject = `Appointment Digest — ${params.today}`;
  const text = `Today (${params.today}): ${params.todayAppointments.length} appointment(s). Tomorrow (${params.tomorrow}): ${params.tomorrowAppointments.length} appointment(s).${params.pdfUrl ? ` Download PDF: ${params.pdfUrl}` : ""}`;
  const pdfCta = params.pdfUrl
    ? `<tr>
              <td align="center" style="padding:20px 24px 4px;">
                <a href="${params.pdfUrl}" style="background:${NAVY};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;padding:13px 28px;border-radius:8px;display:inline-block;">
                  Download PDF
                </a>
              </td>
            </tr>`
    : "";
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${PAGE_BG};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:640px;width:100%;">
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
                      <div style="font-size:11px;opacity:0.8;">Daily Appointment Digest</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 4px;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:18px;font-weight:bold;color:${TEXT_DARK};margin-bottom:4px;">Today — ${params.today} (${params.todayAppointments.length})</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 24px 0;">
                ${appointmentListTable(params.todayAppointments)}
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 4px;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:18px;font-weight:bold;color:${TEXT_DARK};margin-bottom:4px;">Tomorrow — ${params.tomorrow} (${params.tomorrowAppointments.length})</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 24px 0;">
                ${appointmentListTable(params.tomorrowAppointments)}
              </td>
            </tr>
            ${pdfCta}
            <tr>
              <td style="padding:24px 24px 28px;font-family:Arial,Helvetica,sans-serif;">
                <div style="border-top:1px solid ${BORDER};padding-top:16px;font-size:11px;color:${TEXT_MUTED};">
                  This is an automated daily digest from ${APP_NAME}'s appointment system. Please do not reply directly to this email.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
