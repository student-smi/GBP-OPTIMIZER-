import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initDatabase } from "@/db";
import { users, workspaces, workspaceMembers } from "@/db/schema";
import { generateSalt, hashPassword } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["owner", "freelancer", "agency_admin"]).default("owner"),
  workspaceName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await initDatabase();
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, email, password, role, workspaceName } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const userId = "usr_" + crypto.randomUUID();
    const now = Date.now();

    // Insert User
    await db.insert(users).values({
      id: userId,
      email: normalizedEmail,
      passwordHash,
      salt,
      name,
      role,
      emailVerified: true, // Auto-verified for seamless MVP onboarding
      createdAt: now,
      updatedAt: now,
    });

    // Create default workspace
    const wsId = "ws_" + crypto.randomUUID();
    const wsSlug = (workspaceName || `${name.split(" ")[0]}'s Workspace`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 6);

    await db.insert(workspaces).values({
      id: wsId,
      name: workspaceName || `${name.split(" ")[0]}'s Workspace`,
      slug: wsSlug,
      plan: role === "agency_admin" ? "agency" : "pro",
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Add as workspace admin
    await db.insert(workspaceMembers).values({
      id: "mem_" + crypto.randomUUID(),
      workspaceId: wsId,
      userId,
      role: "admin",
      createdAt: now,
    });

    // Create session and set cookie
    await createSession(userId);

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: normalizedEmail,
        name,
        role,
        workspaceId: wsId,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
