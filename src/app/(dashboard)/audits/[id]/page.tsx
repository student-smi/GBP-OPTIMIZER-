import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db, initDatabase } from "@/db";
import { audits, businesses, auditCategoryScores, auditFindings, recommendations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { FindingItem } from "@/components/audit/finding-item";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Printer,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    redirect("/login");
  }

  const { id } = await params;

  // Tenant-isolated query
  const auditRecords = await db
    .select()
    .from(audits)
    .where(and(eq(audits.id, id), eq(audits.workspaceId, user.workspaceId)))
    .limit(1);

  if (auditRecords.length === 0) {
    notFound();
  }

  const audit = auditRecords[0];

  // Fetch business metadata
  const bizRecords = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, audit.businessId))
    .limit(1);

  const business = bizRecords[0] || null;

  // Fetch Category Scores
  const categoryScores = await db
    .select()
    .from(auditCategoryScores)
    .where(eq(auditCategoryScores.auditId, id));

  // Fetch Findings
  const findingsList = await db
    .select()
    .from(auditFindings)
    .where(eq(auditFindings.auditId, id));

  // Fetch Recommendations to pair with findings
  const recList = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.auditId, id));

  // Map recommendation details to findings
  const populatedFindings = findingsList.map((f) => {
    const rec = recList.find((r) => r.findingId === f.id);
    return {
      id: f.id,
      categoryKey: f.categoryKey,
      title: f.title,
      description: f.description,
      evidence: f.evidence,
      severity: f.severity as any,
      deduction: f.deduction,
      recommendation: rec
        ? {
            title: rec.title,
            problemDescription: rec.description,
            suggestedAction: rec.actionSteps,
            expectedBenefit: rec.expectedBenefit,
            effort: rec.effort as any,
            manualConfirmationRequired: true,
            canAutomateThroughIntegration: rec.canAutomate,
          }
        : undefined,
    };
  });

  const criticalFindings = populatedFindings.filter((f) => f.severity === "critical");
  const highFindings = populatedFindings.filter((f) => f.severity === "high");
  const mediumFindings = populatedFindings.filter((f) => f.severity === "medium");
  const lowFindings = populatedFindings.filter((f) => f.severity === "low");

  return (
    <div className="space-y-8">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={business ? `/businesses/${business.id}` : "/dashboard"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Business Profile</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Audit Diagnostic Report
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit ID: <span className="font-mono">{audit.id}</span> • Completed on{" "}
            {formatDateTime(audit.auditTimestamp)} • Data Source:{" "}
            <span className="capitalize font-semibold">{audit.dataSource.replace("_", " ")}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/reports/${audit.id}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 shadow-sm">
              <Printer className="w-4 h-4" />
              <span>Printable Report</span>
            </Button>
          </Link>

          <Link href="/ai-studio">
            <Button variant="default" size="sm" className="gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>AI Content Studio</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Business Meta Summary Card */}
      {business && (
        <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5] flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">{business.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {business.primaryCategory}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {business.address ? `${business.address}, ` : ""}
                {business.city ? `${business.city}, ` : ""}
                {business.state || business.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground border-t sm:border-t-0 pt-3 sm:pt-0">
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                Coverage
              </span>
              <span className="text-foreground text-sm font-black">
                {audit.coveragePercentage}%
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                Total Gaps
              </span>
              <span className="text-[#111111] text-sm font-black">
                {populatedFindings.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Score Overview: Gauge + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Health Score Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Profile Health Score</CardTitle>
            <CardDescription>
              Deterministic 100-point index calculated from verified profile fields and guidelines.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 flex flex-col items-center justify-center">
            <ScoreGauge score={audit.overallScore} size={200} />
          </CardContent>
          <div className="p-4 border-t border-border/50 bg-muted/20 text-[11px] text-muted-foreground text-center">
            Scores reflect profile completeness, accuracy, and engagement — not guaranteed search rankings.
          </div>
        </Card>

        {/* Category Breakdown Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Category Score Distribution</CardTitle>
            <CardDescription>
              Transparent breakdown across the 6 core optimization pillars.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown categories={categoryScores} />
          </CardContent>
        </Card>
      </div>

      {/* Audit Findings & Recommendations */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Audit Findings & Actionable Recommendations ({populatedFindings.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Review specific evidence and follow recommended steps to resolve each gap.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {criticalFindings.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalFindings.length} Critical
              </Badge>
            )}
            {highFindings.length > 0 && (
              <Badge variant="warning" className="text-xs">
                {highFindings.length} High
              </Badge>
            )}
            {mediumFindings.length > 0 && (
              <Badge variant="info" className="text-xs">
                {mediumFindings.length} Medium
              </Badge>
            )}
          </div>
        </div>

        {populatedFindings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-[#111111] mx-auto" />
              <h3 className="text-base font-bold text-foreground">
                Exemplary Profile Health
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No deficiencies detected! All verified categories meet or exceed recommended Google Business Profile baselines.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {populatedFindings.map((finding) => (
              <FindingItem key={finding.id} finding={finding} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
