import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db";
import { workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  // Fetch workspace details
  let workspace = null;
  if (user.workspaceId) {
    const ws = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, user.workspaceId))
      .limit(1);
    if (ws.length > 0) {
      workspace = ws[0];
    }
  }

  return NextResponse.json({
    authenticated: true,
    user,
    workspace,
  });
}
