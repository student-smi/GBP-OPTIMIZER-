/**
 * High-Quality Deterministic AI Content Fallback Templates
 * Ensures 100% functionality and rich output even without an external LLM API key.
 */

export interface DescriptionParams {
  businessName: string;
  category: string;
  city?: string;
  services?: string[];
  tone?: "professional" | "friendly" | "authoritative";
}

export function generateFallbackDescription(params: DescriptionParams): string {
  const { businessName, category, city = "the local area", services = [] } = params;
  const servicesList =
    services.length > 0
      ? services.slice(0, 4).join(", ")
      : "comprehensive solutions tailored to your unique requirements";

  return `Welcome to ${businessName}, your premier ${category.toLowerCase()} serving ${city} and surrounding communities. We take tremendous pride in delivering exceptional craftsmanship, dependable customer care, and prompt service. Our experienced team specializes in ${servicesList}. Whether you need immediate support, scheduled maintenance, or expert consultations, ${businessName} is committed to exceeding your expectations with transparent pricing, certified professionals, and guaranteed satisfaction. Contact us today or visit our location in ${city} to discover why neighbors throughout our region trust us for all their ${category.toLowerCase()} needs.`;
}

export interface ReviewReplyParams {
  businessName: string;
  reviewerName?: string;
  starRating: number;
  reviewText?: string;
}

export function generateFallbackReviewReply(params: ReviewReplyParams): string {
  const { businessName, reviewerName = "valued customer", starRating, reviewText = "" } = params;

  if (starRating >= 4) {
    return `Hi ${reviewerName}, thank you so much for the glowing ${starRating}-star review! Our entire team at ${businessName} truly appreciates your kind words. Delivering reliable, top-quality service is always our priority, and knowing you had a seamless experience means the world to us. We look forward to welcoming you back again soon!`;
  }

  if (starRating === 3) {
    return `Hello ${reviewerName}, thank you for taking the time to share your honest feedback with ${businessName}. While we are glad we were able to assist you, we constantly strive for 5-star excellence and would love to understand how we can make your next experience even better. Please reach out to our management team directly so we can ensure all your expectations are met.`;
  }

  // 1-2 stars (Critical review)
  return `Dear ${reviewerName}, thank you for bringing this to our attention. At ${businessName}, we hold our service standards to the highest level, and we are genuinely sorry to hear that your experience fell short of what you deserved. We take your feedback seriously and want to make this right. Please contact our owner or general manager directly at your earliest convenience so we can investigate and resolve this matter immediately.`;
}

export interface BusinessPostParams {
  businessName: string;
  category: string;
  postType: "offer" | "update" | "event";
  topic?: string;
}

export function generateFallbackBusinessPost(params: BusinessPostParams): {
  headline: string;
  body: string;
  callToAction: string;
} {
  const { businessName, category, postType, topic = "our featured services" } = params;

  if (postType === "offer") {
    return {
      headline: `Special Community Offer at ${businessName}! 🎉`,
      body: `Looking for trusted ${category.toLowerCase()} services? For a limited time, ${businessName} is offering a special discount for local homeowners and businesses! Take advantage of seasonal savings on ${topic}. Our certified team is ready to deliver fast, reliable results backed by our satisfaction guarantee. Mention this Google Business Profile post when booking your appointment!`,
      callToAction: "Call Now / Book Online",
    };
  }

  if (postType === "event") {
    return {
      headline: `Join ${businessName} for Our Community Showcase 📅`,
      body: `Mark your calendars! ${businessName} is hosting an exclusive local event focusing on ${topic}. Come meet our master technicians, ask questions about maintaining your property, and enjoy special promotional giveaways. We love connecting with our local community and sharing expert guidance you can rely on.`,
      callToAction: "Learn More",
    };
  }

  // Standard update
  return {
    headline: `Latest Update from ${businessName} ✨`,
    body: `We are excited to share new improvements to our ${topic}! At ${businessName}, continuous innovation and prompt service are at the core of everything we do. Whether you are scheduling your routine seasonal inspection or planning a new project, our experienced team is here to assist every step of the way. Call or message us today for your complimentary estimate.`,
    callToAction: "Contact Us",
  };
}

export interface ServiceDescriptionParams {
  businessName: string;
  serviceName: string;
  category: string;
}

export function generateFallbackServiceDescription(params: ServiceDescriptionParams): string {
  const { businessName, serviceName, category } = params;
  return `${businessName} provides precision ${serviceName} solutions designed for maximum durability and efficiency. As licensed ${category.toLowerCase()} specialists, we utilize industry-leading diagnostic tools and premium materials to ensure every project meets rigorous quality and safety standards. From detailed initial assessments to spotless cleanup, our technicians handle your ${serviceName} needs with utmost professionalism, upfront flat-rate pricing, and prompt turnarounds.`;
}
