export type Severity = "critical" | "high" | "medium" | "low";
export type Effort = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed" | "dismissed";

export type AuditCategoryKey =
  | "completeness"
  | "accuracy"
  | "categories"
  | "reviews"
  | "photos"
  | "website";

export interface BusinessProfileInput {
  name: string;
  primaryCategory: string;
  additionalCategories?: string[];
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  website?: string;
  description?: string;
  openingHours?: Record<string, string> | string;
  services?: string[];
  products?: string[];
  attributes?: string[] | Record<string, boolean | string>;
  photosCount?: number;
  exteriorPhotos?: number;
  interiorPhotos?: number;
  teamPhotos?: number;
  reviewCount?: number;
  averageRating?: number;
  unansweredReviews?: number;
  isServiceAreaBusiness?: boolean;
}

export interface RecommendationDetails {
  title: string;
  problemDescription: string;
  suggestedAction: string;
  expectedBenefit: string;
  effort: Effort;
  manualConfirmationRequired: boolean;
  canAutomateThroughIntegration: boolean;
}

export interface AuditFinding {
  id: string;
  categoryKey: AuditCategoryKey;
  ruleId: string;
  title: string;
  description: string;
  evidence: string;
  severity: Severity;
  deduction: number;
  recommendation: RecommendationDetails;
}

export interface CategoryScoreResult {
  categoryKey: AuditCategoryKey;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  findings: AuditFinding[];
  evaluatedRulesCount: number;
  passedRulesCount: number;
}

export interface AuditResult {
  overallScore: number;
  coveragePercentage: number;
  categories: Record<AuditCategoryKey, CategoryScoreResult>;
  allFindings: AuditFinding[];
  auditTimestamp: number;
  dataSource: "manual" | "places_api" | "gbp_connected";
}

export const CATEGORY_METADATA: Record<
  AuditCategoryKey,
  { name: string; weight: number; description: string }
> = {
  completeness: {
    name: "Profile Completeness",
    weight: 30,
    description: "Evaluates presence of core fields (name, categories, hours, description, services, products).",
  },
  accuracy: {
    name: "Business Information Accuracy",
    weight: 20,
    description: "Checks formatting validity, URL protocol (HTTPS), description quality, and hours continuity.",
  },
  categories: {
    name: "Categories & Services Relevance",
    weight: 15,
    description: "Evaluates primary category specificity, secondary categories, and granular services.",
  },
  reviews: {
    name: "Reviews Management",
    weight: 15,
    description: "Evaluates review count threshold, star rating average, and reply coverage.",
  },
  photos: {
    name: "Photos & Visual Content",
    weight: 10,
    description: "Checks exterior, interior, team, and overall photo inventory sufficiency.",
  },
  website: {
    name: "Website & Local SEO",
    weight: 10,
    description: "Inspects public website URL health, HTTPS security, and local SEO alignment.",
  },
};
