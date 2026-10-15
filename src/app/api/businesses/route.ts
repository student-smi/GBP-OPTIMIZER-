import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initDatabase } from "@/db";
import { businesses, audits } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";

const businessInputSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  primaryCategory: z.string().min(2, "Primary category is required"),
  additionalCategories: z.array(z.string()).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("US"),
  phone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  openingHours: z.any().optional(),
  services: z.array(z.string()).optional(),
  products: z.array(z.string()).optional(),
  photosCount: z.number().default(0),
  exteriorPhotos: z.number().default(0),
  interiorPhotos: z.number().default(0),
  teamPhotos: z.number().default(0),
  reviewCount: z.number().default(0),
  averageRating: z.number().default(0), // decimal, e.g. 4.8
  unansweredReviews: z.number().default(0),
  isServiceAreaBusiness: z.boolean().default(false),
});

export async function GET() {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Tenant-isolated query: strictly filter by workspaceId to prevent IDOR
  const list = await db
    .select()
    .from(businesses)
    .where(eq(businesses.workspaceId, user.workspaceId))
    .orderBy(desc(businesses.createdAt));

  // Attach latest audit score if available
  const businessesWithAudit = await Promise.all(
    list.map(async (biz) => {
      const latestAudit = await db
        .select()
        .from(audits)
        .where(eq(audits.businessId, biz.id))
        .orderBy(desc(audits.createdAt))
        .limit(1);

      return {
        ...biz,
        additionalCategories: biz.additionalCategories ? JSON.parse(biz.additionalCategories) : [],
        services: biz.services ? JSON.parse(biz.services) : [],
        products: biz.products ? JSON.parse(biz.products) : [],
        openingHours: biz.openingHours ? JSON.parse(biz.openingHours) : null,
        averageRating: (biz.averageRating || 0) / 10,
        latestAudit: latestAudit[0] || null,
      };
    })
  );

  return NextResponse.json({ businesses: businessesWithAudit });
}

export async function POST(request: Request) {
  try {
    await initDatabase();
    const user = await getCurrentUser();
    if (!user || !user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = businessInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const businessId = "biz_" + crypto.randomUUID();
    const now = Date.now();

    await db.insert(businesses).values({
      id: businessId,
      workspaceId: user.workspaceId,
      name: data.name.trim(),
      primaryCategory: data.primaryCategory.trim(),
      additionalCategories: data.additionalCategories ? JSON.stringify(data.additionalCategories) : null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      postalCode: data.postalCode?.trim() || null,
      country: data.country || "US",
      phone: data.phone?.trim() || null,
      website: data.website?.trim() || null,
      description: data.description?.trim() || null,
      openingHours: data.openingHours ? JSON.stringify(data.openingHours) : null,
      services: data.services ? JSON.stringify(data.services) : null,
      products: data.products ? JSON.stringify(data.products) : null,
      photosCount: data.photosCount,
      exteriorPhotos: data.exteriorPhotos,
      interiorPhotos: data.interiorPhotos,
      teamPhotos: data.teamPhotos,
      reviewCount: data.reviewCount,
      averageRating: Math.round((data.averageRating || 0) * 10),
      unansweredReviews: data.unansweredReviews,
      isServiceAreaBusiness: data.isServiceAreaBusiness,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      businessId,
    });
  } catch (error: any) {
    console.error("Create business error:", error);
    return NextResponse.json({ error: error.message || "Failed to create business" }, { status: 500 });
  }
}
