import { NextResponse } from "next/server";
import { db, initDatabase } from "@/db";
import { businesses, audits, businessLocations, recommendations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";

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

  // Strict tenant check: business must belong to user's workspace
  const record = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.id, id), eq(businesses.workspaceId, user.workspaceId)))
    .limit(1);

  if (record.length === 0) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const biz = record[0];

  // Fetch audits for this business
  const auditList = await db
    .select()
    .from(audits)
    .where(eq(audits.businessId, id))
    .orderBy(desc(audits.createdAt));

  // Fetch locations
  const locations = await db
    .select()
    .from(businessLocations)
    .where(eq(businessLocations.businessId, id));

  // Fetch open tasks count
  const tasks = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.businessId, id));

  return NextResponse.json({
    business: {
      ...biz,
      additionalCategories: biz.additionalCategories ? JSON.parse(biz.additionalCategories) : [],
      services: biz.services ? JSON.parse(biz.services) : [],
      products: biz.products ? JSON.parse(biz.products) : [],
      openingHours: biz.openingHours ? JSON.parse(biz.openingHours) : null,
      averageRating: (biz.averageRating || 0) / 10,
    },
    audits: auditList,
    locations,
    tasksCount: {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Verify ownership
  const existing = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.id, id), eq(businesses.workspaceId, user.workspaceId)))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const now = Date.now();
  await db
    .update(businesses)
    .set({
      name: body.name !== undefined ? body.name : undefined,
      primaryCategory: body.primaryCategory !== undefined ? body.primaryCategory : undefined,
      additionalCategories:
        body.additionalCategories !== undefined ? JSON.stringify(body.additionalCategories) : undefined,
      address: body.address !== undefined ? body.address : undefined,
      city: body.city !== undefined ? body.city : undefined,
      state: body.state !== undefined ? body.state : undefined,
      postalCode: body.postalCode !== undefined ? body.postalCode : undefined,
      phone: body.phone !== undefined ? body.phone : undefined,
      website: body.website !== undefined ? body.website : undefined,
      description: body.description !== undefined ? body.description : undefined,
      openingHours: body.openingHours !== undefined ? JSON.stringify(body.openingHours) : undefined,
      services: body.services !== undefined ? JSON.stringify(body.services) : undefined,
      products: body.products !== undefined ? JSON.stringify(body.products) : undefined,
      photosCount: body.photosCount !== undefined ? body.photosCount : undefined,
      exteriorPhotos: body.exteriorPhotos !== undefined ? body.exteriorPhotos : undefined,
      interiorPhotos: body.interiorPhotos !== undefined ? body.interiorPhotos : undefined,
      teamPhotos: body.teamPhotos !== undefined ? body.teamPhotos : undefined,
      reviewCount: body.reviewCount !== undefined ? body.reviewCount : undefined,
      averageRating:
        body.averageRating !== undefined ? Math.round(body.averageRating * 10) : undefined,
      unansweredReviews:
        body.unansweredReviews !== undefined ? body.unansweredReviews : undefined,
      updatedAt: now,
    })
    .where(eq(businesses.id, id));

  return NextResponse.json({ success: true, message: "Business updated successfully" });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Strict tenant check
  const deleted = await db
    .delete(businesses)
    .where(and(eq(businesses.id, id), eq(businesses.workspaceId, user.workspaceId)));

  return NextResponse.json({ success: true, message: "Business deleted successfully" });
}
