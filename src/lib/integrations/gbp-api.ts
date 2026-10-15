/**
 * Modular Official Google Business Profile (GBP) API Client
 * Interface conforming to Google's My Business Business Information & Account Management APIs.
 */

export interface GBPLocation {
  name: string; // "locations/{locationId}"
  title: string;
  storefrontAddress?: {
    addressLines: string[];
    locality: string;
    administrativeArea: string;
    postalCode: string;
    regionCode: string;
  };
  phoneNumbers?: {
    primaryPhone: string;
  };
  websiteUri?: string;
  regularHours?: {
    periods: Array<{
      openDay: string;
      openTime: string;
      closeDay: string;
      closeTime: string;
    }>;
  };
  categories?: {
    primaryCategory: {
      displayName: string;
      categoryId: string;
    };
    additionalCategories?: Array<{
      displayName: string;
      categoryId: string;
    }>;
  };
}

export interface GBPReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

/**
 * Lists all authorized Google Business Profile locations for an authenticated account.
 */
export async function getGBPLocations(accessToken: string, accountId: string): Promise<GBPLocation[]> {
  const endpoint = `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,regularHours,categories`;
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GBP locations: ${response.status}`);
  }

  const data = await response.json();
  return data.locations || [];
}

/**
 * Retrieves reviews for a given GBP location.
 */
export async function getGBPReviews(accessToken: string, locationId: string): Promise<GBPReview[]> {
  const endpoint = `https://mybusiness.googleapis.com/v4/accounts/-/locations/${locationId}/reviews`;
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GBP reviews: ${response.status}`);
  }

  const data = await response.json();
  return data.reviews || [];
}

/**
 * Replies to a specific Google Review using official API.
 */
export async function replyToGBPReview(
  accessToken: string,
  locationId: string,
  reviewId: string,
  replyComment: string
): Promise<{ comment: string; updateTime: string }> {
  const endpoint = `https://mybusiness.googleapis.com/v4/accounts/-/locations/${locationId}/reviews/${reviewId}/reply`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment: replyComment }),
  });

  if (!response.ok) {
    throw new Error(`Failed to publish GBP review reply: ${response.status}`);
  }

  return response.json();
}
