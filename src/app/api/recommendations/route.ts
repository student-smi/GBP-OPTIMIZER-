import { NextResponse } from "next/server";
import { db, initDatabase } from "@/db";
import { recommendations, businesses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: Request) {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const severityFilter = searchParams.get("severity");
  const businessIdFilter = searchParams.get("businessId");

  const query = db
    .select({
      id: recommendations.id,
      auditId: recommendations.auditId,
      businessId: recommendations.businessId,
      workspaceId: recommendations.workspaceId,
      findingId: recommendations.findingId,
      title: recommendations.title,
      description: recommendations.description,
      actionSteps: recommendations.actionSteps,
      expectedBenefit: recommendations.expectedBenefit,
      effort: recommendations.effort,
      severity: recommendations.severity,
      status: recommendations.status,
      canAutomate: recommendations.canAutomate,
      updatedAt: recommendations.updatedAt,
      businessName: businesses.name,
      primaryCategory: businesses.primaryCategory,
    })
    .from(recommendations)
    .innerJoin(businesses, eq(recommendations.businessId, businesses.id))
    .where(eq(recommendations.workspaceId, user.workspaceId))
    .orderBy(desc(recommendations.updatedAt));

  const list = await query;

  let filtered = list;
  if (statusFilter && statusFilter !== "all") {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }
  if (severityFilter && severityFilter !== "all") {
    filtered = filtered.filter((r) => r.severity === severityFilter);
  }
  if (businessIdFilter && businessIdFilter !== "all") {
    filtered = filtered.filter((r) => r.businessId === businessIdFilter);
  }

  const counts = {
    total: list.length,
    pending: list.filter((r) => r.status === "pending").length,
    inProgress: list.filter((r) => r.status === "in_progress").length,
    completed: list.filter((r) => r.status === "completed").length,
    dismissed: list.filter((r) => r.status === "dismissed").length,
  };

  return NextResponse.json({
    recommendations: filtered,
    counts,
  });
}
