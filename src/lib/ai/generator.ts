import {
  generateFallbackDescription,
  generateFallbackReviewReply,
  generateFallbackBusinessPost,
  generateFallbackServiceDescription,
  DescriptionParams,
  ReviewReplyParams,
  BusinessPostParams,
  ServiceDescriptionParams,
} from "./templates";

export interface AIContentResponse {
  content: string;
  headline?: string;
  callToAction?: string;
  modelUsed: string;
  isFallback: boolean;
}

/**
 * Calls Gemini API if configured; otherwise uses reliable deterministic templates.
 */
async function callGeminiIfAvailable(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }),
      signal: AbortSignal.timeout(8000), // 8-second safety timeout
    });

    if (!response.ok) {
      console.warn("Gemini API returned error status:", response.status);
      return null;
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText ? candidateText.trim() : null;
  } catch (error) {
    console.warn("Gemini API call failed, switching to deterministic fallback:", error);
    return null;
  }
}

export async function generateBusinessDescription(params: DescriptionParams): Promise<AIContentResponse> {
  const prompt = `Write an optimized, engaging Google Business Profile description for a business named "${params.businessName}". 
Primary Category: ${params.category}. 
City/Region: ${params.city || "local area"}. 
Services offered: ${(params.services || []).join(", ")}.
Requirements: Keep length between 450 and 700 characters. Factual, professional, no spam, no ALL CAPS, no links or phone numbers. Highlight dependability, customer care, and local commitment.`;

  const geminiResult = await callGeminiIfAvailable(prompt);
  if (geminiResult) {
    return {
      content: geminiResult,
      modelUsed: "gemini-1.5-flash",
      isFallback: false,
    };
  }

  return {
    content: generateFallbackDescription(params),
    modelUsed: "deterministic-template-engine",
    isFallback: true,
  };
}

export async function generateReviewReply(params: ReviewReplyParams): Promise<AIContentResponse> {
  const prompt = `Draft a polite, professional Google Review response from merchant "${params.businessName}".
Reviewer: ${params.reviewerName || "Customer"}.
Rating: ${params.starRating} out of 5 stars.
Customer feedback: "${params.reviewText || "Positive rating"}".
Guidelines: Never be defensive. Thank them. Address concerns constructively if negative. Keep it authentic and under 120 words.`;

  const geminiResult = await callGeminiIfAvailable(prompt);
  if (geminiResult) {
    return {
      content: geminiResult,
      modelUsed: "gemini-1.5-flash",
      isFallback: false,
    };
  }

  return {
    content: generateFallbackReviewReply(params),
    modelUsed: "deterministic-template-engine",
    isFallback: true,
  };
}

export async function generateBusinessPost(params: BusinessPostParams): Promise<AIContentResponse> {
  const prompt = `Generate a Google Business Profile Post update for "${params.businessName}" (${params.category}).
Post Type: ${params.postType} (e.g. promotional offer, community update, or event).
Topic focus: ${params.topic || "services"}.
Format output as:
HEADLINE: [punchy headline under 60 chars]
BODY: [engaging text between 100-180 words]
CTA: [Call to Action button recommendation]`;

  const geminiResult = await callGeminiIfAvailable(prompt);
  if (geminiResult) {
    const lines = geminiResult.split("\n").map((l) => l.trim()).filter(Boolean);
    let headline = "";
    let cta = "Learn More";
    let body = geminiResult;

    for (const line of lines) {
      if (line.toUpperCase().startsWith("HEADLINE:")) {
        headline = line.replace(/HEADLINE:/i, "").trim();
      } else if (line.toUpperCase().startsWith("CTA:")) {
        cta = line.replace(/CTA:/i, "").trim();
      }
    }

    return {
      content: body,
      headline: headline || `${params.businessName} Update`,
      callToAction: cta,
      modelUsed: "gemini-1.5-flash",
      isFallback: false,
    };
  }

  const fallback = generateFallbackBusinessPost(params);
  return {
    content: fallback.body,
    headline: fallback.headline,
    callToAction: fallback.callToAction,
    modelUsed: "deterministic-template-engine",
    isFallback: true,
  };
}

export async function generateServiceDescription(params: ServiceDescriptionParams): Promise<AIContentResponse> {
  const prompt = `Write a detailed, client-facing service catalog description for service item: "${params.serviceName}" offered by "${params.businessName}" (${params.category}).
Explain what the service entails, quality standards, and why local customers choose them. Around 80-120 words.`;

  const geminiResult = await callGeminiIfAvailable(prompt);
  if (geminiResult) {
    return {
      content: geminiResult,
      modelUsed: "gemini-1.5-flash",
      isFallback: false,
    };
  }

  return {
    content: generateFallbackServiceDescription(params),
    modelUsed: "deterministic-template-engine",
    isFallback: true,
  };
}
