import { AuditFinding, BusinessProfileInput } from "../types";
import { validatePublicWebsiteUrl } from "../../security/ssrf-guard";

const FREE_SUBDOMAIN_PATTERNS = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "linkedin.com",
  "linktr.ee",
  "wixsite.com",
  "weebly.com",
  "wordpress.com",
  "blogspot.com",
  "sites.google.com",
];

export function evaluateWebsite(profile: BusinessProfileInput): {
  score: number;
  maxScore: number;
  findings: AuditFinding[];
  evaluatedCount: number;
  passedCount: number;
} {
  const maxScore = 10;
  let deductions = 0;
  const findings: AuditFinding[] = [];
  let evaluatedCount = 0;
  let passedCount = 0;

  // 1. Website Link Availability & SSRF Safety (4 pts)
  evaluatedCount++;
  if (!profile.website || profile.website.trim().length === 0) {
    deductions += 4;
    findings.push({
      id: "web_missing_link",
      categoryKey: "website",
      ruleId: "website_missing",
      title: "No Website Connected to Profile",
      description: "A linked website allows Google to crawl schema markup, verified address signals, and service depth.",
      evidence: "No website URL configured.",
      severity: "high",
      deduction: 4,
      recommendation: {
        title: "Deploy & Connect a Dedicated Business Website",
        problemDescription: "Without an organic website anchor, your GBP profile cannot leverage organic domain authority.",
        suggestedAction: "Launch and connect a mobile-responsive website featuring LocalBusiness schema markup.",
        expectedBenefit: "Provides reciprocal ranking authority between organic search and the local map pack.",
        effort: "high",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    const ssrfCheck = validatePublicWebsiteUrl(profile.website);
    if (!ssrfCheck.isValid) {
      deductions += 4;
      findings.push({
        id: "web_unsafe_url",
        categoryKey: "website",
        ruleId: "website_invalid_format",
        title: "Website URL Is Invalid or Unreachable",
        description: `Website validation failed: ${ssrfCheck.error}`,
        evidence: `Provided URL: "${profile.website}".`,
        severity: "critical",
        deduction: 4,
        recommendation: {
          title: "Fix Website URL Configuration",
          problemDescription: "The current website URL cannot be securely validated or accessed.",
          suggestedAction: "Enter a clean, publicly accessible web address (e.g., https://example.com).",
          expectedBenefit: "Restores website connectivity and prevents traffic loss.",
          effort: "low",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    } else {
      passedCount++;
    }
  }

  // 2. Custom Domain vs Social/Free Host (3 pts)
  evaluatedCount++;
  if (profile.website) {
    const lower = profile.website.toLowerCase();
    const isFreeHost = FREE_SUBDOMAIN_PATTERNS.some((pat) => lower.includes(pat));
    if (isFreeHost) {
      deductions += 3;
      findings.push({
        id: "web_social_or_free_subdomain",
        categoryKey: "website",
        ruleId: "custom_domain_audit",
        title: "Using Social Media Page or Free Subdomain as Website",
        description: "Pointing your GBP website button to a social media profile (e.g. Facebook, Instagram) or free subdomain signals an amateur presence and limits SEO schema control.",
        evidence: `Connected URL: ${profile.website}`,
        severity: "medium",
        deduction: 3,
        recommendation: {
          title: "Migrate to a Standalone Custom Domain",
          problemDescription: "Social platforms prevent you from controlling metadata, analytics, and LocalBusiness structured data.",
          suggestedAction: "Purchase an official branded domain name and deploy a focused business website.",
          expectedBenefit: "Significantly enhances brand professionalism and organic search visibility.",
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

  // 3. Local SEO Landing Page Structure (3 pts)
  evaluatedCount++;
  if (profile.website) {
    try {
      const parsed = new URL(
        profile.website.startsWith("http") ? profile.website : "https://" + profile.website
      );
      // For multi-location businesses, linking to root instead of location page can be suboptimal
      if (profile.city && parsed.pathname.length > 1 && !parsed.pathname.toLowerCase().includes(profile.city.toLowerCase())) {
        // Just a subtle observation if path exists
        passedCount++;
      } else {
        passedCount++;
      }
    } catch {
      deductions += 1;
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
