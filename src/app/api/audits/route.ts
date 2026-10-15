import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initDatabase } from "@/db";
import { businesses, audits, auditCategoryScores, auditFindings, recommendations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { runBusinessProfileAudit } from "@/lib/audit-engine/runner";
import { eq, and, desc } from "drizzle-orm";

const runAuditSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  dataSource: z.enum(["manual", "places_api", "gbp_connected"]).default("manual"),
});

export async function GET() {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Tenant-isolated audit list
  const list = await db
    .select({
      id: audits.id,
      businessId: audits.businessId,
      overallScore: audits.overallScore,
      coveragePercentage: audits.coveragePercentage,
      status: audits.status,
      dataSource: audits.dataSource,
      auditTimestamp: audits.auditTimestamp,
      createdAt: audits.createdAt,
      businessName: businesses.name,
      primaryCategory: businesses.primaryCategory,
      city: businesses.city,
    })
    .from(audits)
    .innerJoin(businesses, eq(audits.businessId, businesses.id))
    .where(eq(audits.workspaceId, user.workspaceId))
    .orderBy(desc(audits.createdAt));

  return NextResponse.json({ audits: list });
}

export async function POST(request: Request) {
  try {
    await initDatabase();
    const user = await getCurrentUser();
    if (!user || !user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = runAuditSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { businessId, dataSource } = parsed.data;

    // Verify tenant ownership
    const bizRecords = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, businessId), eq(businesses.workspaceId, user.workspaceId)))
      .limit(1);

    if (bizRecords.length === 0) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
    }

    const biz = bizRecords[0];

    // Format business profile for the audit engine
    const profileInput = {
      name: biz.name,
      primaryCategory: biz.primaryCategory,
      additionalCategories: biz.additionalCategories ? JSON.parse(biz.additionalCategories) : [],
      address: biz.address || undefined,
      city: biz.city || undefined,
      state: biz.state || undefined,
      postalCode: biz.postalCode || undefined,
      country: biz.country || "US",
      phone: biz.phone || undefined,
      website: biz.website || undefined,
      description: biz.description || undefined,
      openingHours: biz.openingHours ? JSON.parse(biz.openingHours) : undefined,
      services: biz.services ? JSON.parse(biz.services) : [],
      products: biz.products ? JSON.parse(biz.products) : [],
      photosCount: biz.photosCount || 0,
      exteriorPhotos: biz.exteriorPhotos || 0,
      interiorPhotos: biz.interiorPhotos || 0,
      teamPhotos: biz.teamPhotos || 0,
      reviewCount: biz.reviewCount || 0,
      averageRating: (biz.averageRating || 0) / 10,
      unansweredReviews: biz.unansweredReviews || 0,
      isServiceAreaBusiness: biz.isServiceAreaBusiness || false,
    };

    // Execute deterministic audit engine
    const result = runBusinessProfileAudit(profileInput, dataSource);

    const auditId = "aud_" + crypto.randomUUID();
    const now = Date.now();

    // 1. Insert Audit Record
    await db.insert(audits).values({
      id: auditId,
      businessId,
      workspaceId: user.workspaceId,
      overallScore: result.overallScore,
      coveragePercentage: result.coveragePercentage,
      status: "completed",
      dataSource,
      auditTimestamp: result.auditTimestamp,
      createdAt: now,
    });

    // 2. Insert Category Scores
    for (const [key, cat] of Object.entries(result.categories)) {
      await db.insert(auditCategoryScores).values({
        id: "cs_" + crypto.randomUUID(),
        auditId,
        categoryKey: key,
        categoryName: cat.name,
        score: cat.score,
        maxScore: cat.maxScore,
        weight: cat.maxScore,
        findingsCount: cat.findings.length,
      });
    }

    // 3. Insert Findings & Generate Interactive Recommendations
    for (const finding of result.allFindings) {
      const findingId = "fnd_" + crypto.randomUUID();
      await db.insert(auditFindings).values({
        id: findingId,
        auditId,
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
        auditId,
        businessId,
        workspaceId: user.workspaceId,
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

    return NextResponse.json({
      success: true,
      auditId,
      overallScore: result.overallScore,
      findingsCount: result.allFindings.length,
    });
  } catch (error: any) {
    console.error("Run audit error:", error);
    return NextResponse.json({ error: error.message || "Audit execution failed" }, { status: 500 });
  }
}
