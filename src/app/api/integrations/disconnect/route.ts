import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db, initDatabase } from "@/db";
import { integrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDatabase();
  const { provider } = await req.json();

  await db
    .delete(integrations)
    .where(
      and(
        eq(integrations.workspaceId, user.workspaceId),
        eq(integrations.provider, provider || "google_oauth")
      )
    );

  return NextResponse.json({ success: true, message: "Integration disconnected successfully" });
}
