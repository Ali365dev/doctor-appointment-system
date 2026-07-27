import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { exchangeGoogleCalendarCode } from "@/services/google/calendar";

/**
 * One-time setup step: Google redirects here with an authorization code after
 * the doctor grants calendar access. Exchanges it for a refresh token and
 * displays it once so it can be copied into GOOGLE_CALENDAR_REFRESH_TOKEN —
 * it is never stored automatically, since .env is the source of truth here.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return new NextResponse(`<p>Google denied authorization: ${error}</p>`, {
      headers: { "Content-Type": "text/html" },
    });
  }
  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const tokens = await exchangeGoogleCalendarCode(code);

  if (!tokens.refresh_token) {
    return new NextResponse(
      `<p>No refresh token returned. This usually means the account already authorized this app before —
       revoke access at <a href="https://myaccount.google.com/permissions" target="_blank">myaccount.google.com/permissions</a>
       and try <a href="/api/auth/google-calendar/connect">connecting again</a>.</p>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(
    `<!doctype html>
<html>
  <body style="font-family:sans-serif;max-width:640px;margin:40px auto;line-height:1.6;">
    <h2>Google Calendar connected</h2>
    <p>Copy the value below into <code>GOOGLE_CALENDAR_REFRESH_TOKEN</code> in your <code>.env</code> and <code>.env.local</code> files, then restart the dev server.</p>
    <textarea readonly style="width:100%;height:80px;font-family:monospace;padding:8px;">${tokens.refresh_token}</textarea>
    <p style="color:#b91c1c;">This is a secret — treat it like a password. Don't commit it or share it.</p>
  </body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
