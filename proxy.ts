import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPatientRoute = pathname.startsWith("/patient");
  const isBookingRoute = pathname.startsWith("/book-appointment");

  if (!isAdminRoute && !isPatientRoute && !isBookingRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session.role !== "doctor") {
    return NextResponse.redirect(new URL("/patient/dashboard", request.url));
  }

  // Booking and the patient portal are both patient-only — a doctor account
  // has no reason to book an appointment with themself.
  if ((isPatientRoute || isBookingRoute) && session.role !== "patient") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/patient/:path*", "/book-appointment/:path*"],
};
