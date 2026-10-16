import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildGoogleAuthUrl } from "@/lib/integrations/google-oauth";
import { generateRandomToken } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        error: "Google OAuth is not configured yet.",
        message: "Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.",
      },
      { status: 400 }
    );
  }

  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    new URL(req.url).host;
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/callback/google`;
  const state = `${user.workspaceId}:${generateRandomToken(16)}`;

  const authUrl = buildGoogleAuthUrl(
    {
      clientId,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectUri,
    },
    state
  );

  return NextResponse.redirect(authUrl);
}
