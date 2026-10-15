/**
 * Modular Google Places API Adapter
 * Used for business search, place autocomplete, and initial profile discovery.
 */

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
}

export interface PlaceDetailsResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  internationalPhoneNumber?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  types: string[];
  openingHours?: {
    weekdayText: string[];
    openNow?: boolean;
  };
  photosCount?: number;
}

/**
 * Searches for a business location via Google Places API TextSearch.
 * Server-side only; never exposes API key to client.
 */
export async function searchGooglePlaces(
  query: string,
  apiKey?: string
): Promise<PlaceSearchResult[]> {
  const key = apiKey || process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    // Graceful offline mock for demo / development without billing API key
    return [
      {
        placeId: "demo_place_01",
        name: query,
        formattedAddress: "123 Business Way, Suite 100, Austin, TX 78701",
        types: ["plumber", "point_of_interest", "establishment"],
        rating: 4.8,
        userRatingsTotal: 34,
      },
    ];
  }

  const endpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query
  )}&key=${key}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Google Places search failed: ${response.status}`);
  }

  const data = await response.json();
  return (data.results || []).map((r: any) => ({
    placeId: r.place_id,
    name: r.name,
    formattedAddress: r.formatted_address,
    types: r.types || [],
    rating: r.rating,
    userRatingsTotal: r.user_ratings_total,
  }));
}

/**
 * Fetches verified place details from Google Places API.
 */
export async function getGooglePlaceDetails(
  placeId: string,
  apiKey?: string
): Promise<PlaceDetailsResult | null> {
  const key = apiKey || process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return {
      placeId,
      name: "Demo Local Business",
      formattedAddress: "123 Business Way, Austin, TX 78701",
      internationalPhoneNumber: "+1 512-555-0199",
      website: "https://example.com",
      rating: 4.7,
      userRatingsTotal: 28,
      types: ["plumber", "home_goods_store"],
      photosCount: 15,
    };
  }

  const fields = "name,formatted_address,international_phone_number,website,rating,user_ratings_total,types,opening_hours,photos";
  const endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${key}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Google Place details failed: ${response.status}`);
  }

  const data = await response.json();
  const r = data.result;
  if (!r) return null;

  return {
    placeId,
    name: r.name,
    formattedAddress: r.formatted_address,
    internationalPhoneNumber: r.international_phone_number,
    website: r.website,
    rating: r.rating,
    userRatingsTotal: r.user_ratings_total,
    types: r.types || [],
    photosCount: (r.photos || []).length,
    openingHours: r.opening_hours
      ? {
          weekdayText: r.opening_hours.weekday_text || [],
          openNow: r.opening_hours.open_now,
        }
      : undefined,
  };
}
