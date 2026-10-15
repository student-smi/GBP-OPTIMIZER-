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
 * Calls Cloudflare Workers AI with official Global Key or API token.
 */
async function callCloudflareWorkersAI(prompt: string): Promise<string | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const email = process.env.CLOUDFLARE_EMAIL;
  const apiKey = process.env.CLOUDFLARE_API_KEY;

  if (!apiKey || !accountId || !email) {
    return null;
  }

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Auth-Email": email,
        "X-Auth-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an expert Google Business Profile copywriter and local SEO consultant. Generate factual, engaging, guideline-compliant content.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(10000), // 10-second safety timeout
    });

    if (!response.ok) {
      console.warn("Cloudflare Workers AI returned status:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.success && data.result?.response) {
      return data.result.response.trim();
    }
    return null;
  } catch (error) {
    console.warn("Cloudflare Workers AI call failed:", error);
    return null;
  }
}

/**
 * Calls Gemini API if configured.
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
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText ? candidateText.trim() : null;
  } catch (error) {
    return null;
  }
}

/**
 * Unified Multi-Provider AI Caller:
 * Priority 1: Cloudflare Workers AI (Llama 3.1)
 * Priority 2: Google Gemini (Gemini 1.5 Flash)
 * Priority 3: Built-in deterministic template engine
 */
async function executeAIGeneration(
  prompt: string
): Promise<{ text: string | null; modelUsed: string }> {
  // 1. Try Cloudflare Workers AI first
  const cfResult = await callCloudflareWorkersAI(prompt);
  if (cfResult) {
    return { text: cfResult, modelUsed: "cloudflare-workers-ai/llama-3.1-8b" };
  }

  // 2. Try Google Gemini
  const geminiResult = await callGeminiIfAvailable(prompt);
  if (geminiResult) {
    return { text: geminiResult, modelUsed: "google/gemini-1.5-flash" };
  }

  return { text: null, modelUsed: "deterministic-template-engine" };
}

export async function generateBusinessDescription(
  params: DescriptionParams
): Promise<AIContentResponse> {
  const prompt = `Write an optimized, engaging Google Business Profile description for a business named "${params.businessName}". 
Primary Category: ${params.category}. 
City/Region: ${params.city || "local area"}. 
Services offered: ${(params.services || []).join(", ")}.
Requirements: Keep length between 450 and 700 characters. Factual, professional, no spam, no ALL CAPS, no links or phone numbers. Highlight dependability, customer care, and local commitment.`;

  const ai = await executeAIGeneration(prompt);
  if (ai.text) {
    return {
      content: ai.text,
      modelUsed: ai.modelUsed,
      isFallback: false,
    };
  }

  return {
    content: generateFallbackDescription(params),
    modelUsed: "deterministic-template-engine",
    isFallback: true,
  };
}

export async function generateReviewReply(
  params: ReviewReplyParams
): Promise<AIContentResponse> {
  const prompt = `Draft a polite, professional Google Review response from merchant "${params.businessName}".
Reviewer: ${params.reviewerName || "Customer"}.
Rating: ${params.starRating} out of 5 stars.
Customer feedback: "${params.reviewText || "Positive rating"}".
Guidelines: Never be defensive. Thank them. Address concerns constructively if negative. Keep it authentic and under 120 words.`;

  const ai = await executeAIGeneration(prompt);
  if (ai.text) {
    return {
      content: ai.text,
      modelUsed: ai.modelUsed,
      isFallback: false,
    };
  }

  return {
    content: generateFallbackReviewReply(params),
    modelUsed: "deterministic-template-engine",
    isFallback: true,
  };
}

export async function generateBusinessPost(
  params: BusinessPostParams
): Promise<AIContentResponse> {
  const prompt = `Generate a Google Business Profile Post update for "${params.businessName}" (${params.category}).
Post Type: ${params.postType} (e.g. promotional offer, community update, or event).
Topic focus: ${params.topic || "services"}.
Format output as:
HEADLINE: [punchy headline under 60 chars]
BODY: [engaging text between 100-180 words]
CTA: [Call to Action button recommendation]`;

  const ai = await executeAIGeneration(prompt);
  if (ai.text) {
    const lines = ai.text.split("\n").map((l) => l.trim()).filter(Boolean);
    let headline = "";
    let cta = "Learn More";
    let body = ai.text;

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
      modelUsed: ai.modelUsed,
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

export async function generateServiceDescription(
  params: ServiceDescriptionParams
): Promise<AIContentResponse> {
  const prompt = `Write a detailed, client-facing service catalog description for service item: "${params.serviceName}" offered by "${params.businessName}" (${params.category}).
Explain what the service entails, quality standards, and why local customers choose them. Around 80-120 words.`;

  const ai = await executeAIGeneration(prompt);
  if (ai.text) {
    return {
      content: ai.text,
      modelUsed: ai.modelUsed,
      isFallback: false,
    };
  }

  return {
    content: generateFallbackServiceDescription(params),
    modelUsed: "deterministic-template-engine",
    isFallback: true,
  };
}
