import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";

export type Session = typeof auth.$Infer.Session;
export type SessionUser = typeof auth.$Infer.Session.user;

/**
 * Returns the current session, or null if unauthenticated.
 * Deduplicated per request via React cache — safe to call multiple times
 * in the same render without extra DB round-trips.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Returns the current user, or null if unauthenticated.
 * Deduplicated per request via React cache.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();
  return session?.user ?? null;
});

/**
 * Asserts the request is authenticated and returns the session.
 * Redirects to /login if there is no active session.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Asserts the request is authenticated and returns the user.
 * Redirects to /login if there is no active session.
 */
export async function requireUser(): Promise<SessionUser> {
  const { user } = await requireSession();
  return user;
}

/**
 * Route Handler guard — returns a 401 NextResponse if unauthenticated.
 * Returns the session if authenticated.
 *
 * @example
 * const result = await requireSessionOrUnauthorized();
 * if (result instanceof NextResponse) return result;
 * const { user } = result;
 */
export async function requireSessionOrUnauthorized(): Promise<
  Session | NextResponse
> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
