import { db, initDatabase } from "./index";
import {
  users,
  workspaces,
  workspaceMembers,
  businesses,
  audits,
  auditCategoryScores,
  auditFindings,
  recommendations,
} from "./schema";
import { generateSalt, hashPassword } from "../lib/auth/crypto";
import { runBusinessProfileAudit } from "../lib/audit-engine/runner";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  await initDatabase();

  // Check if already seeded
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, "demo@gbpoptimizer.com"))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: true, message: "Database already seeded." };
  }

  const now = Date.now();
  const salt = generateSalt();
  const passwordHash = await hashPassword("Password123!", salt);

  const demoUserId = "usr_demo_agency_admin";
  const demoWorkspaceId = "ws_apex_agency";

  // 1. Create Demo User
  await db.insert(users).values({
    id: demoUserId,
    email: "demo@gbpoptimizer.com",
    passwordHash,
    salt,
    name: "Alex Vance",
    role: "agency_admin",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });

  // 2. Create Agency Workspace
  await db.insert(workspaces).values({
    id: demoWorkspaceId,
    name: "Apex Local SEO Agency",
    slug: "apex-seo-agency",
    plan: "agency",
    ownerId: demoUserId,
    createdAt: now,
    updatedAt: now,
  });

  // 3. Workspace Member
  await db.insert(workspaceMembers).values({
    id: "mem_" + crypto.randomUUID(),
    workspaceId: demoWorkspaceId,
    userId: demoUserId,
    role: "admin",
    createdAt: now,
  });

  // 4. Create Business 1: Apex Precision Plumbing (Score ~82)
  const biz1Id = "biz_apex_plumbing";
  const biz1Data = {
    id: biz1Id,
    workspaceId: demoWorkspaceId,
    name: "Apex Precision Plumbing & HVAC",
    primaryCategory: "Plumber",
    additionalCategories: JSON.stringify(["HVAC Contractor", "Drainage Service"]),
    address: "742 Evergreen Terrace",
    city: "Austin",
    state: "TX",
    postalCode: "78701",
    country: "US",
    phone: "+1 (512) 555-0188",
    website: "https://apexplumbingaustin.com",
    description:
      "Apex Precision Plumbing & HVAC provides 24/7 master plumbing and cooling services across greater Austin. Backed by over 20 years of craftsmanship.",
    openingHours: JSON.stringify({
      monday: "08:00 - 18:00",
      tuesday: "08:00 - 18:00",
      wednesday: "08:00 - 18:00",
      thursday: "08:00 - 18:00",
      friday: "08:00 - 18:00",
      saturday: "09:00 - 15:00",
    }),
    services: JSON.stringify([
      "Tankless Water Heater Installation",
      "Hydro Jetting Drain Cleaning",
      "Sewer Camera Inspection",
    ]),
    products: JSON.stringify(["Whole-Home Water Filtration System"]),
    photosCount: 22,
    exteriorPhotos: 4,
    interiorPhotos: 6,
    teamPhotos: 3,
    reviewCount: 38,
    averageRating: 48, // 4.8
    unansweredReviews: 3,
    createdAt: now - 86400000 * 5,
    updatedAt: now,
  };

  await db.insert(businesses).values(biz1Data);

  // Run audit for Biz 1
  const audit1Result = runBusinessProfileAudit({
    name: biz1Data.name,
    primaryCategory: biz1Data.primaryCategory,
    additionalCategories: JSON.parse(biz1Data.additionalCategories),
    address: biz1Data.address,
    city: biz1Data.city,
    state: biz1Data.state,
    postalCode: biz1Data.postalCode,
    phone: biz1Data.phone,
    website: biz1Data.website,
    description: biz1Data.description,
    openingHours: JSON.parse(biz1Data.openingHours),
    services: JSON.parse(biz1Data.services),
    products: JSON.parse(biz1Data.products),
    photosCount: biz1Data.photosCount,
    exteriorPhotos: biz1Data.exteriorPhotos,
    interiorPhotos: biz1Data.interiorPhotos,
    teamPhotos: biz1Data.teamPhotos,
    reviewCount: biz1Data.reviewCount,
    averageRating: 4.8,
    unansweredReviews: biz1Data.unansweredReviews,
  });

  const audit1Id = "aud_01_apex";
  await db.insert(audits).values({
    id: audit1Id,
    businessId: biz1Id,
    workspaceId: demoWorkspaceId,
    overallScore: audit1Result.overallScore,
    coveragePercentage: audit1Result.coveragePercentage,
    status: "completed",
    dataSource: "manual",
    auditTimestamp: now - 86400000 * 2,
    createdAt: now - 86400000 * 2,
  });

  // Insert Category Scores
  for (const [catKey, catVal] of Object.entries(audit1Result.categories)) {
    await db.insert(auditCategoryScores).values({
      id: "cs_" + crypto.randomUUID(),
      auditId: audit1Id,
      categoryKey: catKey,
      categoryName: catVal.name,
      score: catVal.score,
      maxScore: catVal.maxScore,
      weight: catVal.maxScore,
      findingsCount: catVal.findings.length,
    });
  }

  // Insert Findings & Recommendations
  for (const finding of audit1Result.allFindings) {
    const findingId = "fnd_" + crypto.randomUUID();
    await db.insert(auditFindings).values({
      id: findingId,
      auditId: audit1Id,
      categoryKey: finding.categoryKey,
      ruleId: finding.ruleId,
      title: finding.title,
      description: finding.description,
      evidence: finding.evidence,
      severity: finding.severity,
      deduction: finding.deduction,
      createdAt: now,
    });

    await db.insert(recommendations).values({
      id: "rec_" + crypto.randomUUID(),
      auditId: audit1Id,
      businessId: biz1Id,
      workspaceId: demoWorkspaceId,
      findingId,
      title: finding.recommendation.title,
      description: finding.recommendation.problemDescription,
      actionSteps: finding.recommendation.suggestedAction,
      expectedBenefit: finding.recommendation.expectedBenefit,
      effort: finding.recommendation.effort,
      severity: finding.severity,
      status: "pending",
      canAutomate: finding.recommendation.canAutomateThroughIntegration,
      updatedAt: now,
    });
  }

  // 5. Create Business 2: Downtown Artisan Bakery (Score ~52)
  const biz2Id = "biz_downtown_bakery";
  const biz2Data = {
    id: biz2Id,
    workspaceId: demoWorkspaceId,
    name: "Downtown Artisan Bakery",
    primaryCategory: "Bakery",
    additionalCategories: null,
    address: "12 Congress Ave",
    city: "Austin",
    state: "TX",
    postalCode: "78701",
    country: "US",
    phone: "5125559876",
    website: "http://downtownbakery.com", // Insecure HTTP
    description: "FRESH CROISSANTS AND ARTISAN SOURDOUGH BREAD EVERY MORNING IN AUSTIN TEXAS", // ALL CAPS
    openingHours: null, // Missing hours
    services: null,
    products: null,
    photosCount: 4,
    exteriorPhotos: 0, // No exterior
    interiorPhotos: 2,
    teamPhotos: 0,
    reviewCount: 8, // Under 10 reviews
    averageRating: 38, // 3.8
    unansweredReviews: 6, // 75% unanswered
    createdAt: now - 86400000 * 10,
    updatedAt: now,
  };

  await db.insert(businesses).values(biz2Data);

  const audit2Result = runBusinessProfileAudit({
    name: biz2Data.name,
    primaryCategory: biz2Data.primaryCategory,
    address: biz2Data.address,
    city: biz2Data.city,
    state: biz2Data.state,
    postalCode: biz2Data.postalCode,
    phone: biz2Data.phone,
    website: biz2Data.website,
    description: biz2Data.description,
    photosCount: biz2Data.photosCount,
    exteriorPhotos: biz2Data.exteriorPhotos,
    interiorPhotos: biz2Data.interiorPhotos,
    teamPhotos: biz2Data.teamPhotos,
    reviewCount: biz2Data.reviewCount,
    averageRating: 3.8,
    unansweredReviews: biz2Data.unansweredReviews,
  });

  const audit2Id = "aud_02_bakery";
  await db.insert(audits).values({
    id: audit2Id,
    businessId: biz2Id,
    workspaceId: demoWorkspaceId,
    overallScore: audit2Result.overallScore,
    coveragePercentage: audit2Result.coveragePercentage,
    status: "completed",
    dataSource: "manual",
    auditTimestamp: now - 86400000 * 1,
    createdAt: now - 86400000 * 1,
  });

  for (const [catKey, catVal] of Object.entries(audit2Result.categories)) {
    await db.insert(auditCategoryScores).values({
      id: "cs_" + crypto.randomUUID(),
      auditId: audit2Id,
      categoryKey: catKey,
      categoryName: catVal.name,
      score: catVal.score,
      maxScore: catVal.maxScore,
      weight: catVal.maxScore,
      findingsCount: catVal.findings.length,
    });
  }

  for (const finding of audit2Result.allFindings) {
    const findingId = "fnd_" + crypto.randomUUID();
    await db.insert(auditFindings).values({
      id: findingId,
      auditId: audit2Id,
      categoryKey: finding.categoryKey,
      ruleId: finding.ruleId,
      title: finding.title,
      description: finding.description,
      evidence: finding.evidence,
      severity: finding.severity,
      deduction: finding.deduction,
      createdAt: now,
    });

    await db.insert(recommendations).values({
      id: "rec_" + crypto.randomUUID(),
      auditId: audit2Id,
      businessId: biz2Id,
      workspaceId: demoWorkspaceId,
      findingId,
      title: finding.recommendation.title,
      description: finding.recommendation.problemDescription,
      actionSteps: finding.recommendation.suggestedAction,
      expectedBenefit: finding.recommendation.expectedBenefit,
      effort: finding.recommendation.effort,
      severity: finding.severity,
      status: "pending",
      canAutomate: finding.recommendation.canAutomateThroughIntegration,
      updatedAt: now,
    });
  }

  return { success: true, message: "Database seeded successfully with demo agency and audit records." };
}
