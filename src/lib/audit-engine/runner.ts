import {
  AuditFinding,
  AuditResult,
  BusinessProfileInput,
  CategoryScoreResult,
  CATEGORY_METADATA,
} from "./types";
import { evaluateCompleteness } from "./rules/completeness";
import { evaluateAccuracy } from "./rules/accuracy";
import { evaluateCategories } from "./rules/categories";
import { evaluateReviews } from "./rules/reviews";
import { evaluatePhotos } from "./rules/photos";
import { evaluateWebsite } from "./rules/website";

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Deterministic Audit Engine for Google Business Profiles
 * Evaluates business profiles against strict 100-point scoring framework.
 */
export function runBusinessProfileAudit(
  profile: BusinessProfileInput,
  dataSource: "manual" | "places_api" | "gbp_connected" = "manual"
): AuditResult {
  const comp = evaluateCompleteness(profile);
  const acc = evaluateAccuracy(profile);
  const cat = evaluateCategories(profile);
  const rev = evaluateReviews(profile);
  const pho = evaluatePhotos(profile);
  const web = evaluateWebsite(profile);

  const categories: Record<string, CategoryScoreResult> = {
    completeness: {
      categoryKey: "completeness",
      name: CATEGORY_METADATA.completeness.name,
      score: comp.score,
      maxScore: comp.maxScore,
      percentage: Math.round((comp.score / comp.maxScore) * 100),
      findings: comp.findings,
      evaluatedRulesCount: comp.evaluatedCount,
      passedRulesCount: comp.passedCount,
    },
    accuracy: {
      categoryKey: "accuracy",
      name: CATEGORY_METADATA.accuracy.name,
      score: acc.score,
      maxScore: acc.maxScore,
      percentage: Math.round((acc.score / acc.maxScore) * 100),
      findings: acc.findings,
      evaluatedRulesCount: acc.evaluatedCount,
      passedRulesCount: acc.passedCount,
    },
    categories: {
      categoryKey: "categories",
      name: CATEGORY_METADATA.categories.name,
      score: cat.score,
      maxScore: cat.maxScore,
      percentage: Math.round((cat.score / cat.maxScore) * 100),
      findings: cat.findings,
      evaluatedRulesCount: cat.evaluatedCount,
      passedRulesCount: cat.passedCount,
    },
    reviews: {
      categoryKey: "reviews",
      name: CATEGORY_METADATA.reviews.name,
      score: rev.score,
      maxScore: rev.maxScore,
      percentage: Math.round((rev.score / rev.maxScore) * 100),
      findings: rev.findings,
      evaluatedRulesCount: rev.evaluatedCount,
      passedRulesCount: rev.passedCount,
    },
    photos: {
      categoryKey: "photos",
      name: CATEGORY_METADATA.photos.name,
      score: pho.score,
      maxScore: pho.maxScore,
      percentage: Math.round((pho.score / pho.maxScore) * 100),
      findings: pho.findings,
      evaluatedRulesCount: pho.evaluatedCount,
      passedRulesCount: pho.passedCount,
    },
    website: {
      categoryKey: "website",
      name: CATEGORY_METADATA.website.name,
      score: web.score,
      maxScore: web.maxScore,
      percentage: Math.round((web.score / web.maxScore) * 100),
      findings: web.findings,
      evaluatedRulesCount: web.evaluatedCount,
      passedRulesCount: web.passedCount,
    },
  };

  const overallScore =
    comp.score + acc.score + cat.score + rev.score + pho.score + web.score;

  const totalEvaluated =
    comp.evaluatedCount +
    acc.evaluatedCount +
    cat.evaluatedCount +
    rev.evaluatedCount +
    pho.evaluatedCount +
    web.evaluatedCount;

  const totalPassed =
    comp.passedCount +
    acc.passedCount +
    cat.passedCount +
    rev.passedCount +
    pho.passedCount +
    web.passedCount;

  const coveragePercentage =
    totalEvaluated > 0 ? Math.round((totalPassed / totalEvaluated) * 100) : 100;

  const allFindings: AuditFinding[] = [
    ...comp.findings,
    ...acc.findings,
    ...cat.findings,
    ...rev.findings,
    ...pho.findings,
    ...web.findings,
  ].sort((a, b) => {
    const diff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (diff !== 0) return diff;
    return b.deduction - a.deduction;
  });

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    coveragePercentage,
    categories: categories as AuditResult["categories"],
    allFindings,
    auditTimestamp: Date.now(),
    dataSource,
  };
}
