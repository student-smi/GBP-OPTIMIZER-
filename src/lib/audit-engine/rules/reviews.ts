import { AuditFinding, BusinessProfileInput } from "../types";

export function evaluateReviews(profile: BusinessProfileInput): {
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

  const count = typeof profile.reviewCount === "number" ? profile.reviewCount : 0;
  const rating = typeof profile.averageRating === "number" ? profile.averageRating : 0;
  const unanswered = typeof profile.unansweredReviews === "number" ? profile.unansweredReviews : 0;

  // 1. Review Volume Audit (6 pts)
  evaluatedCount++;
  if (count === 0) {
    deductions += 6;
    findings.push({
      id: "rev_zero_reviews",
      categoryKey: "reviews",
      ruleId: "review_volume_zero",
      title: "Zero Customer Reviews on Profile",
      description: "Profiles without customer reviews suffer from a severe trust deficit and rarely rank in competitive local 3-packs.",
      evidence: "Current review count is 0.",
      severity: "critical",
      deduction: 6,
      recommendation: {
        title: "Launch an Immediate Review Generation Campaign",
        problemDescription: "Prospective customers consistently choose competitors with verified social proof.",
        suggestedAction: "Send your official Google Review shortlink to your 10 most recent satisfied customers via SMS or email.",
        expectedBenefit: "Establishes baseline consumer trust and activates Google's review algorithm signals.",
        effort: "medium",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: false,
      },
    });
  } else if (count < 10) {
    deductions += 3;
    findings.push({
      id: "rev_low_volume",
      categoryKey: "reviews",
      ruleId: "review_volume_low",
      title: "Low Total Review Count (Under 10)",
      description: `You currently have ${count} review(s). Most competitive local categories require a minimum of 20-30 reviews for strong visibility.`,
      evidence: `Total reviews: ${count}.`,
      severity: "high",
      deduction: 3,
      recommendation: {
        title: "Systematize Customer Feedback Requests",
        problemDescription: "Low review count leaves your listing vulnerable to competitor displacement.",
        suggestedAction: "Incorporate review request QR codes on receipts, invoices, or post-service follow-up messages.",
        expectedBenefit: "Gradually builds review velocity and sustains local pack presence.",
        effort: "medium",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: false,
      },
    });
  } else if (count < 25) {
    deductions += 1;
    findings.push({
      id: "rev_moderate_volume",
      categoryKey: "reviews",
      ruleId: "review_volume_moderate",
      title: "Moderate Review Volume (10–24)",
      description: `With ${count} reviews, your profile has established baseline credibility, but increasing volume will expand local reach.`,
      evidence: `Total reviews: ${count}.`,
      severity: "low",
      deduction: 1,
      recommendation: {
        title: "Target 25+ Verified Reviews Milestone",
        problemDescription: "Top-ranking local businesses in your category average higher review volumes.",
        suggestedAction: "Keep a regular cadence of asking 2-3 satisfied clients per week for feedback.",
        expectedBenefit: "Strengthens rank durability across wider geographic search radiuses.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: false,
      },
    });
  } else {
    passedCount++;
  }

  // 2. Average Star Rating Evaluation (5 pts)
  evaluatedCount++;
  if (count > 0) {
    if (rating < 3.5) {
      deductions += 5;
      findings.push({
        id: "rev_low_rating",
        categoryKey: "reviews",
        ruleId: "rating_critical",
        title: "Sub-3.5 Star Average Rating",
        description: `Your average rating of ${rating.toFixed(1)} stars represents a severe risk to conversion and visibility.`,
        evidence: `Average rating: ${rating.toFixed(1)} / 5.0 stars across ${count} reviews.`,
        severity: "critical",
        deduction: 5,
        recommendation: {
          title: "Address Customer Complaints & Solicit Positive Feedback",
          problemDescription: "Over 70% of consumers filter out businesses with ratings below 4.0 stars.",
          suggestedAction: "Audit recurring negative feedback topics, improve underlying service bottlenecks, and prioritize outreach to delighted clients.",
          expectedBenefit: "Protects reputation and restores conversion trust.",
          effort: "high",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: false,
        },
      });
    } else if (rating < 4.0) {
      deductions += 3;
      findings.push({
        id: "rev_mediocre_rating",
        categoryKey: "reviews",
        ruleId: "rating_concern",
        title: "Average Rating Below 4.0 Stars",
        description: `Average rating is ${rating.toFixed(1)}. Google users frequently filter search results to '4.0 stars and above'.`,
        evidence: `Average rating: ${rating.toFixed(1)} / 5.0 stars.`,
        severity: "high",
        deduction: 3,
        recommendation: {
          title: "Improve Rating Above 4.0 Star Threshold",
          problemDescription: "You are currently excluded whenever searchers apply Google's 'Top rated (4.0+)' filter.",
          suggestedAction: "Reach out to recent happy customers to encourage authentic positive reviews.",
          expectedBenefit: "Re-qualifies profile for filtered search queries on Maps.",
          effort: "medium",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: false,
        },
      });
    } else if (rating < 4.5) {
      deductions += 1;
      findings.push({
        id: "rev_good_rating",
        categoryKey: "reviews",
        ruleId: "rating_good",
        title: "Rating Between 4.0 and 4.4 Stars",
        description: `Good rating of ${rating.toFixed(1)}, with room to reach the gold standard of 4.6–4.9.`,
        evidence: `Average rating: ${rating.toFixed(1)} / 5.0 stars.`,
        severity: "low",
        deduction: 1,
        recommendation: {
          title: "Aim for 4.5+ Star Sweet Spot",
          problemDescription: "A 4.5+ rating provides optimal consumer trust without looking fabricated.",
          suggestedAction: "Continue providing exceptional customer service and requesting feedback consistently.",
          expectedBenefit: "Maximizes conversion from profile impressions into phone calls and visits.",
          effort: "low",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: false,
        },
      });
    } else {
      passedCount++;
    }
  } else {
    passedCount++;
  }

  // 3. Review Response Coverage (4 pts)
  evaluatedCount++;
  if (count > 0) {
    const answeredCount = Math.max(0, count - unanswered);
    const responseRate = count > 0 ? (answeredCount / count) * 100 : 0;

    if (unanswered > 0 && responseRate < 60) {
      deductions += 4;
      findings.push({
        id: "rev_low_response_rate",
        categoryKey: "reviews",
        ruleId: "review_unanswered_high",
        title: "Significant Unanswered Review Backlog",
        description: `You have ${unanswered} unanswered reviews (${Math.round(responseRate)}% reply rate). Google explicitly confirms that responding to reviews improves your local SEO.`,
        evidence: `${unanswered} of ${count} reviews have not received a merchant response.`,
        severity: "high",
        deduction: 4,
        recommendation: {
          title: "Reply to Outstanding Customer Reviews",
          problemDescription: "Unanswered reviews signal an unmonitored business and miss opportunity for positive sentiment reinforcement.",
          suggestedAction: "Use our AI Studio to generate personalized, professional replies to each pending review.",
          expectedBenefit: "Demonstrates active customer service and signals profile engagement to Google's algorithms.",
          effort: "medium",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    } else if (unanswered > 0 && responseRate < 90) {
      deductions += 2;
      findings.push({
        id: "rev_moderate_unanswered",
        categoryKey: "reviews",
        ruleId: "review_unanswered_moderate",
        title: "Unanswered Customer Reviews Detected",
        description: `There are ${unanswered} reviews awaiting your reply (Response rate: ${Math.round(responseRate)}%).`,
        evidence: `${unanswered} pending review replies.`,
        severity: "medium",
        deduction: 2,
        recommendation: {
          title: "Achieve 95%+ Review Reply Coverage",
          problemDescription: "Even a small number of ignored reviews can leave negative impressions unaddressed.",
          suggestedAction: "Respond to the remaining unanswered reviews within 48 hours.",
          expectedBenefit: "Maintains exemplary profile responsiveness metrics.",
          effort: "low",
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
