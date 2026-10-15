import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db, initDatabase } from "@/db";
import { businesses, geoGridScans, audits } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateRandomToken } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

export interface GeoGridPin {
  id: string;
  row: number;
  col: number;
  latOffsetKm: number;
  lngOffsetKm: number;
  rank: number; // 1 to 20+
  distanceKm: number;
  competitors: {
    rank: number;
    name: string;
    rating: number;
    reviewsCount: number;
    isUserBusiness: boolean;
  }[];
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDatabase();
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json({ error: "businessId parameter is required" }, { status: 400 });
  }

  const scans = await db
    .select()
    .from(geoGridScans)
    .where(and(eq(geoGridScans.businessId, businessId), eq(geoGridScans.workspaceId, user.workspaceId)))
    .orderBy(desc(geoGridScans.createdAt));

  return NextResponse.json({
    scans: scans.map((s) => ({
      ...s,
      pinsData: JSON.parse(s.pinsData),
      averageRank: s.averageRank / 10,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDatabase();
  const body = await req.json();
  const { businessId, keyword, gridSize = "3x3", radiusKm = 5 } = body;

  if (!businessId || !keyword) {
    return NextResponse.json({ error: "businessId and keyword are required" }, { status: 400 });
  }

  // Verify business belongs to user's workspace
  const bizRecords = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.workspaceId, user.workspaceId)))
    .limit(1);

  if (bizRecords.length === 0) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const biz = bizRecords[0];

  // Fetch latest audit score to factor into geo rank prominence
  const latestAudits = await db
    .select()
    .from(audits)
    .where(eq(audits.businessId, businessId))
    .orderBy(desc(audits.createdAt))
    .limit(1);

  const overallHealth = latestAudits.length > 0 ? latestAudits[0].overallScore : 70;
  const reviewCount = biz.reviewCount || 10;
  const rating = (biz.averageRating || 45) / 10;

  // Determine grid dimensions
  const dimension = gridSize === "5x5" ? 5 : 3;
  const step = radiusKm / (dimension - 1);
  const halfDim = Math.floor(dimension / 2);

  const competitorsPool = [
    { name: "Apex Local Pro", baseRating: 4.8, baseReviews: 95 },
    { name: "Metro Pioneer Services", baseRating: 4.6, baseReviews: 64 },
    { name: "City Elite Specialists", baseRating: 4.7, baseReviews: 82 },
    { name: "Premier Express Co.", baseRating: 4.5, baseReviews: 48 },
    { name: "Downtown Master Group", baseRating: 4.4, baseReviews: 38 },
  ];

  const pins: GeoGridPin[] = [];
  let totalRank = 0;
  let top3Count = 0;

  for (let r = 0; r < dimension; r++) {
    for (let c = 0; c < dimension; c++) {
      const latOffset = (r - halfDim) * step;
      const lngOffset = (c - halfDim) * step;
      const distFromCenter = Math.sqrt(latOffset * latOffset + lngOffset * lngOffset);

      // Deterministic ranking formula:
      // Base rank starts at 1 at center.
      // Increases by 1 rank for every 1.5 - 2.5 km of distance, mitigated by high audit health
      const healthMitigation = (overallHealth - 50) / 25; // range: 0 to 2
      const distancePenalty = Math.floor(distFromCenter / (1.2 + healthMitigation * 0.5));
      const jitter = ((r * 3 + c * 7) % 3) - 1; // subtle realistic local variance
      let calculatedRank = Math.max(1, 1 + distancePenalty + jitter);

      if (distFromCenter === 0) {
        calculatedRank = 1; // Center storefront rank
      }

      totalRank += calculatedRank;
      if (calculatedRank <= 3) {
        top3Count++;
      }

      // Build simulated local competitor rankings for this specific pin
      const pinCompetitors = [
        {
          rank: calculatedRank,
          name: biz.name,
          rating,
          reviewsCount: reviewCount,
          isUserBusiness: true,
        },
      ];

      // Add surrounding competitors
      let currentCompRank = 1;
      for (const comp of competitorsPool) {
        if (currentCompRank === calculatedRank) {
          currentCompRank++;
        }
        if (pinCompetitors.length < 5) {
          pinCompetitors.push({
            rank: currentCompRank,
            name: comp.name,
            rating: comp.baseRating,
            reviewsCount: comp.baseReviews,
            isUserBusiness: false,
          });
          currentCompRank++;
        }
      }

      pinCompetitors.sort((a, b) => a.rank - b.rank);

      pins.push({
        id: `pin_${r}_${c}`,
        row: r,
        col: c,
        latOffsetKm: parseFloat(latOffset.toFixed(2)),
        lngOffsetKm: parseFloat(lngOffset.toFixed(2)),
        distanceKm: parseFloat(distFromCenter.toFixed(2)),
        rank: calculatedRank,
        competitors: pinCompetitors,
      });
    }
  }

  const totalPins = pins.length;
  const avgRank = totalRank / totalPins;
  const top3Pct = Math.round((top3Count / totalPins) * 100);
  const shareOfVoice = Math.max(10, Math.round(100 - avgRank * 12));

  const scanId = `geo_${generateRandomToken(8)}`;
  const now = Date.now();

  await db.insert(geoGridScans).values({
    id: scanId,
    businessId,
    workspaceId: user.workspaceId,
    keyword,
    gridSize,
    radiusKm,
    averageRank: Math.round(avgRank * 10),
    top3Percentage: top3Pct,
    shareOfLocalVoice: shareOfVoice,
    pinsData: JSON.stringify(pins),
    createdAt: now,
  });

  return NextResponse.json({
    scan: {
      id: scanId,
      businessId,
      workspaceId: user.workspaceId,
      keyword,
      gridSize,
      radiusKm,
      averageRank: avgRank,
      top3Percentage: top3Pct,
      shareOfLocalVoice: shareOfVoice,
      pinsData: pins,
      createdAt: now,
    },
  });
}
