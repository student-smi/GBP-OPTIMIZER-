import { NextRequest, NextResponse } from "next/server";
import { searchGooglePlaces, getGooglePlaceDetails } from "@/lib/integrations/google-places";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  const placeId = req.nextUrl.searchParams.get("placeId");

  try {
    if (placeId) {
      const details = await getGooglePlaceDetails(placeId);
      return NextResponse.json({ success: true, details });
    }

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results = await searchGooglePlaces(query.trim());
    return NextResponse.json({
      success: true,
      results,
      isLiveKey: Boolean(process.env.GOOGLE_PLACES_API_KEY),
    });
  } catch (error: any) {
    console.error("Places API error:", error);
    return NextResponse.json(
      { error: "Places search failed", message: error.message },
      { status: 500 }
    );
  }
}
