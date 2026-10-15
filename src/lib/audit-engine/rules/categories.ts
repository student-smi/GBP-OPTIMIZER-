import { AuditFinding, BusinessProfileInput } from "../types";

const OVERLY_GENERIC_CATEGORIES = new Set([
  "store",
  "shop",
  "company",
  "business",
  "service",
  "office",
  "establishment",
  "consultant",
  "contractor",
]);

export function evaluateCategories(profile: BusinessProfileInput): {
  score: number;
  maxScore: number;
  findings: AuditFinding[];
  evaluatedCount: number;
  passedCount: number;
} {
  const maxScore = 15;
  let deductions = 0;
  const findings: AuditFinding[] = [];
  let evaluatedCount = 0;
  let passedCount = 0;

  // 1. Primary Category Specificity (6 pts)
  evaluatedCount++;
  if (profile.primaryCategory) {
    const normalized = profile.primaryCategory.trim().toLowerCase();
    if (OVERLY_GENERIC_CATEGORIES.has(normalized)) {
      deductions += 6;
      findings.push({
        id: "cat_generic_primary",
        categoryKey: "categories",
        ruleId: "primary_specificity",
        title: "Primary Category Is Too Broad or Generic",
        description: `"${profile.primaryCategory}" is overly generic. Google rewards highly specific classifications.`,
        evidence: `Selected primary category: "${profile.primaryCategory}".`,
        severity: "critical",
        deduction: 6,
        recommendation: {
          title: "Refine Primary Category to Exact Specialty",
          problemDescription: "Generic categories dilute ranking signals across thousands of unrelated local competitors.",
          suggestedAction: "Change from a broad category to an exact niche category (e.g. choose 'Italian Restaurant' or 'Pizza Restaurant' instead of generic 'Restaurant').",
          expectedBenefit: "Dramatically sharpens Google's algorithmic relevance for your core transactional search terms.",
          effort: "low",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    } else {
      passedCount++;
    }
  } else {
    // Handled in completeness
    passedCount++;
  }

  // 2. Additional Categories Optimization (5 pts)
  evaluatedCount++;
  const additional = Array.isArray(profile.additionalCategories)
    ? profile.additionalCategories.filter((c) => c && c.trim().length > 0)
    : [];

  if (additional.length === 0) {
    deductions += 5;
    findings.push({
      id: "cat_no_additional_categories",
      categoryKey: "categories",
      ruleId: "secondary_categories",
      title: "No Secondary Categories Configured",
      description: "Google Business Profiles can define up to 9 secondary categories to capture related search queries.",
      evidence: "Current secondary category count is 0.",
      severity: "high",
      deduction: 5,
      recommendation: {
        title: "Add 2 to 5 Relevant Secondary Categories",
        problemDescription: "You are currently missing out on qualified impressions for complementary service searches.",
        suggestedAction: "Select between 2 and 5 secondary categories that directly describe legitimate secondary lines of business.",
        expectedBenefit: "Expands your profile's total keyword footprint across local Maps discovery searches.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else if (additional.length > 9) {
    deductions += 2;
    findings.push({
      id: "cat_too_many_secondary",
      categoryKey: "categories",
      ruleId: "secondary_category_bloat",
      title: "Excessive Secondary Categories (Over 9)",
      description: "Google limits secondary categories to 9. Adding excessive categories can dilute primary category strength.",
      evidence: `Configured ${additional.length} secondary categories.`,
      severity: "low",
      deduction: 2,
      recommendation: {
        title: "Prune Secondary Categories to Highest-Value Offerings",
        problemDescription: "Category bloat dilutes your core topical relevance and may trigger quality warnings.",
        suggestedAction: "Focus exclusively on 3 to 6 high-relevance secondary categories.",
        expectedBenefit: "Focuses topical authority and preserves primary category strength.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 3. Service Items Granularity (4 pts)
  evaluatedCount++;
  const services = Array.isArray(profile.services) ? profile.services : [];
  if (services.length > 0) {
    const singleWordCount = services.filter((s) => s.trim().split(/\s+/).length === 1).length;
    if (services.length >= 3 && singleWordCount / services.length > 0.7) {
      deductions += 2;
      findings.push({
        id: "cat_vague_services",
        categoryKey: "categories",
        ruleId: "services_granularity",
        title: "Services List Uses Vague or One-Word Labels",
        description: "Services like 'Repair' or 'Cleaning' are too vague. Use descriptive phrases like 'Emergency Commercial AC Repair'.",
        evidence: `${singleWordCount} of ${services.length} services are single words.`,
        severity: "low",
        deduction: 2,
        recommendation: {
          title: "Enrich Service Names with Specific Context",
          problemDescription: "Vague single-word services fail to match user intent queries in search.",
          suggestedAction: "Update service items with explicit, consumer-facing descriptions and price indicators.",
          expectedBenefit: "Increases click-through rate when search justifications appear on mobile listings.",
          effort: "medium",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    } else {
      passedCount++;
    }
  } else {
    passedCount++;
  }

  const finalScore = Math.max(0, maxScore - deductions);
  return {
    score: finalScore,
    maxScore,
    findings,
    evaluatedCount,
    passedCount,
  };
}
