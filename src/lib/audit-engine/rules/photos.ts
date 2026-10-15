import { AuditFinding, BusinessProfileInput } from "../types";

export function evaluatePhotos(profile: BusinessProfileInput): {
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

  const totalPhotos = typeof profile.photosCount === "number" ? profile.photosCount : 0;
  const exterior = typeof profile.exteriorPhotos === "number" ? profile.exteriorPhotos : 0;
  const interior = typeof profile.interiorPhotos === "number" ? profile.interiorPhotos : 0;
  const team = typeof profile.teamPhotos === "number" ? profile.teamPhotos : 0;

  // 1. Total Photo Volume (4 pts)
  evaluatedCount++;
  if (totalPhotos === 0) {
    deductions += 4;
    findings.push({
      id: "photo_zero_images",
      categoryKey: "photos",
      ruleId: "photos_total_zero",
      title: "No Photos Uploaded to Business Profile",
      description: "Google reports that businesses with photos receive 42% more requests for directions and 35% more website clicks.",
      evidence: "Current photo inventory is 0.",
      severity: "high",
      deduction: 4,
      recommendation: {
        title: "Upload High-Resolution Business Photography",
        problemDescription: "Profiles lacking images appear abandoned and suffer lower consumer interaction.",
        suggestedAction: "Upload at least 15 to 25 authentic, well-lit photographs showcasing your storefront, products, and team.",
        expectedBenefit: "Boosts listing click-through rates and directional requests on Google Maps.",
        effort: "medium",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else if (totalPhotos < 10) {
    deductions += 2;
    findings.push({
      id: "photo_low_volume",
      categoryKey: "photos",
      ruleId: "photos_total_low",
      title: "Low Photo Volume (Under 10 Photos)",
      description: `Only ${totalPhotos} photos detected. High-performing local businesses maintain 30+ visual assets.`,
      evidence: `Total photo count is ${totalPhotos}.`,
      severity: "medium",
      deduction: 2,
      recommendation: {
        title: "Expand Photo Gallery with Fresh Media",
        problemDescription: "A sparse gallery reduces visual engagement compared to active local competitors.",
        suggestedAction: "Add 10 or more new photos illustrating your work, customer areas, and recent projects.",
        expectedBenefit: "Keeps the profile engaging and signals regular activity to search algorithms.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 2. Exterior Storefront Photos (2 pts)
  evaluatedCount++;
  if (exterior === 0 && !profile.isServiceAreaBusiness) {
    deductions += 2;
    findings.push({
      id: "photo_no_exterior",
      categoryKey: "photos",
      ruleId: "photos_exterior_missing",
      title: "Missing Exterior Storefront Photography",
      description: "Exterior photos help arriving customers identify your physical building, signage, and parking entrance.",
      evidence: "Exterior photo count is 0.",
      severity: "medium",
      deduction: 2,
      recommendation: {
        title: "Upload Clear Daytime Exterior & Signage Photos",
        problemDescription: "Clients navigating to your premises may struggle to locate your entrance.",
        suggestedAction: "Capture high-contrast daytime shots of your building facade, entrance, and road-facing sign.",
        expectedBenefit: "Assists customer wayfinding and confirms physical legitimacy to Google.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 3. Interior Ambiance Photos (2 pts)
  evaluatedCount++;
  if (interior === 0 && !profile.isServiceAreaBusiness) {
    deductions += 2;
    findings.push({
      id: "photo_no_interior",
      categoryKey: "photos",
      ruleId: "photos_interior_missing",
      title: "Missing Interior Atmosphere Photos",
      description: "Interior photos give prospective customers a feel for your environment, cleanliness, and seating/reception areas.",
      evidence: "Interior photo count is 0.",
      severity: "low",
      deduction: 2,
      recommendation: {
        title: "Add Photos of Your Welcome & Work Spaces",
        problemDescription: "First-time visitors appreciate seeing the interior ambiance before visiting.",
        suggestedAction: "Upload photos of your lobby, desks, workstations, or dining rooms.",
        expectedBenefit: "Creates welcoming expectations and improves dwell time.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 4. Team & Human Presence Photos (2 pts)
  evaluatedCount++;
  if (team === 0) {
    deductions += 2;
    findings.push({
      id: "photo_no_team",
      categoryKey: "photos",
      ruleId: "photos_team_missing",
      title: "No Team or Staff Photos",
      description: "Authentic photos of founders and team members build immediate emotional connection and trust.",
      evidence: "Team photo count is 0.",
      severity: "low",
      deduction: 2,
      recommendation: {
        title: "Showcase Your Staff and Craftspeople",
        problemDescription: "Profiles without human faces look impersonal compared to local neighborhood businesses.",
        suggestedAction: "Upload candid or professional photos of your team helping clients or performing work.",
        expectedBenefit: "Humanizes your brand and increases customer conversion confidence.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
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
