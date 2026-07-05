import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./getSession";
import type { SessionPayload, UserRole } from "@/lib/session";

/**
 * Server-side guard for use at the top of a protected layout/page.
 * Redirects to /login if there's no session, or to the caller's own
 * dashboard if the session's role doesn't match what the route requires.
 */
export async function requireRole(role: UserRole): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== role) {
    redirect(session.role === "doctor" ? "/admin/dashboard" : "/patient/dashboard");
  }

  return session;
}
