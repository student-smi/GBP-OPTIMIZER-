import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initDatabase } from "@/db";
import { recommendations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "dismissed"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const user = await getCurrentUser();
    if (!user || !user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const { status } = parsed.data;

    // Verify tenant ownership
    const existing = await db
      .select()
      .from(recommendations)
      .where(and(eq(recommendations.id, id), eq(recommendations.workspaceId, user.workspaceId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    const now = Date.now();
    await db
      .update(recommendations)
      .set({ status, updatedAt: now })
      .where(eq(recommendations.id, id));

    return NextResponse.json({ success: true, status, updatedAt: now });
  } catch (error: any) {
    console.error("Update task status error:", error);
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 500 });
  }
}
