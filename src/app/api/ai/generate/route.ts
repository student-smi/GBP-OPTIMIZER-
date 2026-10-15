import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initDatabase } from "@/db";
import { generatedContent, businesses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import {
  generateBusinessDescription,
  generateReviewReply,
  generateBusinessPost,
  generateServiceDescription,
} from "@/lib/ai/generator";
import { eq, and } from "drizzle-orm";

const generateSchema = z.object({
  businessId: z.string().optional(),
  type: z.enum(["description", "review_reply", "post", "service"]),
  businessName: z.string().min(1, "Business name is required"),
  category: z.string().min(1, "Category is required"),
  city: z.string().optional(),
  services: z.array(z.string()).optional(),
  // For review reply
  reviewerName: z.string().optional(),
  starRating: z.number().optional(),
  reviewText: z.string().optional(),
  // For post
  postType: z.enum(["offer", "update", "event"]).optional(),
  topic: z.string().optional(),
  // For service
  serviceName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await initDatabase();
    const user = await getCurrentUser();
    if (!user || !user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let result;

    switch (data.type) {
      case "description":
        result = await generateBusinessDescription({
          businessName: data.businessName,
          category: data.category,
          city: data.city,
          services: data.services,
        });
        break;

      case "review_reply":
        result = await generateReviewReply({
          businessName: data.businessName,
          reviewerName: data.reviewerName,
          starRating: data.starRating || 5,
          reviewText: data.reviewText,
        });
        break;

      case "post":
        result = await generateBusinessPost({
          businessName: data.businessName,
          category: data.category,
          postType: data.postType || "update",
          topic: data.topic,
        });
        break;

      case "service":
        result = await generateServiceDescription({
          businessName: data.businessName,
          category: data.category,
          serviceName: data.serviceName || "Core Solution",
        });
        break;
    }

    // Persist to database if businessId is supplied
    if (data.businessId) {
      const now = Date.now();
      await db.insert(generatedContent).values({
        id: "gen_" + crypto.randomUUID(),
        workspaceId: user.workspaceId,
        businessId: data.businessId,
        type: data.type,
        prompt: JSON.stringify(data),
        content: result.content,
        modelUsed: result.modelUsed,
        createdAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("AI generation route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}
