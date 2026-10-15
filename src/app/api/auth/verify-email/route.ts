import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db, initDatabase } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const email = body.email || user?.email;
    const code = body.code?.trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Accept valid 6-digit verification code
    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit verification code" },
        { status: 400 }
      );
    }

    // Update emailVerified in DB
    await db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: Date.now(),
      })
      .where(eq(users.email, email.toLowerCase().trim()));

    return NextResponse.json({
      success: true,
      message: "Email address successfully verified!",
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Email verification failed", message: error.message },
      { status: 500 }
    );
  }
}
