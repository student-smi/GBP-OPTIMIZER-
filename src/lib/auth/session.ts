import { cookies } from "next/headers";
import { db, initDatabase } from "@/db";
import { sessions, users, workspaces, workspaceMembers } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { generateSessionToken, hashSessionToken } from "./crypto";

export const SESSION_COOKIE_NAME = "gbp_session_token";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: "owner" | "freelancer" | "agency_admin" | "client";
  emailVerified: boolean;
  workspaceId: string;
  workspaceRole: "admin" | "editor" | "viewer";
}

/**
 * Creates a new secure session and sets the HTTP-only cookie.
 */
export async function createSession(userId: string): Promise<string> {
  await initDatabase();
  const token = generateSessionToken();
  const tokenHash = await hashSessionToken(token);
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  const sessionId = "sess_" + crypto.randomUUID();

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    tokenHash,
    expiresAt,
    createdAt: now,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });

  return token;
}

/**
 * Retrieves the currently authenticated user from the session cookie.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  await initDatabase();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const tokenHash = await hashSessionToken(token);
    const now = Date.now();

    const sessionRecord = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
      .limit(1);

    if (sessionRecord.length === 0) return null;
    const session = sessionRecord[0];

    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userRecord.length === 0) return null;
    const user = userRecord[0];

    // Find the primary or active workspace for this user
    let workspaceId = "";
    let workspaceRole: "admin" | "editor" | "viewer" = "admin";

    const memberRecord = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id))
      .limit(1);

    if (memberRecord.length > 0) {
      workspaceId = memberRecord[0].workspaceId;
      workspaceRole = memberRecord[0].role;
    } else {
      // Look up workspace owned by user
      const ownedWs = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.ownerId, user.id))
        .limit(1);

      if (ownedWs.length > 0) {
        workspaceId = ownedWs[0].id;
        workspaceRole = "admin";
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      workspaceId,
      workspaceRole,
    };
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

/**
 * Invalidates the current session and clears the cookie.
 */
export async function destroySession(): Promise<void> {
  await initDatabase();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const tokenHash = await hashSessionToken(token);
      await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error("Failed to destroy session:", error);
  }
}
