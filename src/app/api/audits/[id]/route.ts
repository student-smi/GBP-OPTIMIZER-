import { NextResponse } from "next/server";
import { db, initDatabase } from "@/db";
import { audits, businesses, auditCategoryScores, auditFindings, recommendations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Tenant isolation check
  const auditRecords = await db
    .select()
    .from(audits)
    .where(and(eq(audits.id, id), eq(audits.workspaceId, user.workspaceId)))
    .limit(1);

  if (auditRecords.length === 0) {
    return NextResponse.json({ error: "Audit record not found" }, { status: 404 });
  }

  const audit = auditRecords[0];

  // Fetch business metadata
  const bizRecords = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, audit.businessId))
    .limit(1);

  const business = bizRecords[0] || null;

  // Fetch category scores
  const categoryScores = await db
    .select()
    .from(auditCategoryScores)
    .where(eq(auditCategoryScores.auditId, id));

  // Fetch findings
  const findings = await db
    .select()
    .from(auditFindings)
    .where(eq(auditFindings.auditId, id));

  // Fetch recommendations
  const tasks = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.auditId, id));

  return NextResponse.json({
    audit,
    business: business
      ? {
          ...business,
          additionalCategories: business.additionalCategories
            ? JSON.parse(business.additionalCategories)
            : [],
          services: business.services ? JSON.parse(business.services) : [],
          products: business.products ? JSON.parse(business.products) : [],
          openingHours: business.openingHours ? JSON.parse(business.openingHours) : null,
          averageRating: (business.averageRating || 0) / 10,
        }
      : null,
    categoryScores,
    findings,
    recommendations: tasks,
  });
}
