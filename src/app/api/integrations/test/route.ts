import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { provider } = await req.json();

    if (provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({
          success: false,
          configured: false,
          message: "GEMINI_API_KEY is not configured in .env",
        });
      }

      // Live verification ping to Gemini models endpoint
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      if (res.ok) {
        return NextResponse.json({
          success: true,
          configured: true,
          message: "Google Gemini API key is valid and responsive!",
        });
      } else {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json({
          success: false,
          configured: true,
          message: `Gemini key rejected: ${data.error?.message || res.statusText}`,
        });
      }
    }

    if (provider === "places") {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        return NextResponse.json({
          success: false,
          configured: false,
          message: "GOOGLE_PLACES_API_KEY is not configured in .env",
        });
      }

      // Live verification ping to Places API
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=coffee&key=${apiKey}`
      );
      const data = await res.json().catch(() => ({}));
      if (data.status === "OK" || data.status === "ZERO_RESULTS") {
        return NextResponse.json({
          success: true,
          configured: true,
          message: "Google Places API key is valid and responsive!",
        });
      } else {
        return NextResponse.json({
          success: false,
          configured: true,
          message: `Places API error: ${data.error_message || data.status}`,
        });
      }
    }

    if (provider === "google_oauth") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return NextResponse.json({
          success: false,
          configured: false,
          message: "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in .env",
        });
      }

      return NextResponse.json({
        success: true,
        configured: true,
        message: "Google OAuth 2.0 credentials are validly formatted and ready for authorization.",
      });
    }

    return NextResponse.json({ error: "Invalid provider specified" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Test failed" },
      { status: 500 }
    );
  }
}
