import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { exchangeGoogleCodeForTokens } from "@/lib/integrations/google-oauth";
import { db, initDatabase } from "@/db";
import { integrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateRandomToken } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initDatabase();
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    new URL(req.url).host;
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  if (error || !code) {
    return NextResponse.redirect(`${origin}/settings?error=google_auth_failed`);
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/settings?error=missing_credentials`);
  }

  try {
    const redirectUri = `${origin}/api/auth/callback/google`;
    const tokens = await exchangeGoogleCodeForTokens(code, {
      clientId,
      clientSecret,
      redirectUri,
    });

    const now = Date.now();

    // Check if integration already exists for this workspace
    const existing = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.workspaceId, user.workspaceId),
          eq(integrations.provider, "google_oauth")
        )
      )
      .limit(1);

    const configData = JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || null,
      expiresAt: now + tokens.expiresIn * 1000,
      scope: tokens.scope,
    });

    if (existing.length > 0) {
      await db
        .update(integrations)
        .set({
          isActive: true,
          config: configData,
          updatedAt: now,
        })
        .where(eq(integrations.id, existing[0].id));
    } else {
      await db.insert(integrations).values({
        id: `int_${generateRandomToken(12)}`,
        workspaceId: user.workspaceId,
        provider: "google_oauth",
        isActive: true,
        config: configData,
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.redirect(`${origin}/settings?success=google_connected`);
  } catch (err: any) {
    console.error("Google OAuth token exchange error:", err);
    return NextResponse.redirect(`${origin}/settings?error=exchange_failed`);
  }
}
