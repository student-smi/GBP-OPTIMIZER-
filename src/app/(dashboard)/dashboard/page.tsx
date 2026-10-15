import React from "react";
import Link from "next/link";
import { db, initDatabase } from "@/db";
import { businesses, audits, recommendations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { getScoreColor, formatDate } from "@/lib/utils";
import {
  Building2,
  FileCheck2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    return null;
  }

  // 1. Fetch businesses in workspace
  const bizList = await db
    .select()
    .from(businesses)
    .where(eq(businesses.workspaceId, user.workspaceId))
    .orderBy(desc(businesses.createdAt));

  // 2. Fetch all audits in workspace
  const auditList = await db
    .select({
      id: audits.id,
      businessId: audits.businessId,
      overallScore: audits.overallScore,
      coveragePercentage: audits.coveragePercentage,
      createdAt: audits.createdAt,
      dataSource: audits.dataSource,
      businessName: businesses.name,
      primaryCategory: businesses.primaryCategory,
    })
    .from(audits)
    .innerJoin(businesses, eq(audits.businessId, businesses.id))
    .where(eq(audits.workspaceId, user.workspaceId))
    .orderBy(desc(audits.createdAt));

  // 3. Fetch pending recommendations
  const pendingTasks = await db
    .select({
      id: recommendations.id,
      title: recommendations.title,
      severity: recommendations.severity,
      effort: recommendations.effort,
      status: recommendations.status,
      businessName: businesses.name,
    })
    .from(recommendations)
    .innerJoin(businesses, eq(recommendations.businessId, businesses.id))
    .where(eq(recommendations.workspaceId, user.workspaceId))
    .orderBy(desc(recommendations.updatedAt));

  // Compute metrics
  const totalBusinesses = bizList.length;
  const totalAudits = auditList.length;
  const averageScore =
    auditList.length > 0
      ? Math.round(
          auditList.reduce((acc, a) => acc + a.overallScore, 0) / auditList.length
        )
      : 0;

  const openTasksCount = pendingTasks.filter((t) => t.status === "pending").length;
  const criticalTasksCount = pendingTasks.filter(
    (t) => t.severity === "critical" && t.status === "pending"
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#E5E5E5] shadow-none">
        <div>
          <span className="text-xs font-bold text-[#777777] uppercase tracking-widest">
            Profile Performance Overview
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] tracking-tight mt-1">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Monitor Google Business Profile completeness, resolve critical optimization gaps, and generate client reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/businesses/new">
            <Button variant="default" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Audit New Business</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Businesses */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Managed Businesses
              </span>
              <div className="p-2 rounded-xl bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5]">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground mt-2">
              {totalBusinesses}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>Locations in this workspace</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Audits Run */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Audits Conducted
              </span>
              <div className="p-2 rounded-xl bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5]">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground mt-2">
              {totalAudits}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <span>Historical audits stored</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Avg Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Avg Profile Health
              </span>
              <div className="p-2 rounded-xl bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground mt-2 flex items-baseline gap-1">
              <span>{averageScore}</span>
              <span className="text-sm font-semibold text-muted-foreground">/ 100</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <span>Across all audited profiles</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Open Action Items */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Open Action Items
              </span>
              <div className="p-2 rounded-xl bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground mt-2">
              {openTasksCount}
            </div>
            <div className="text-xs text-[#111111] font-semibold mt-1">
              {criticalTasksCount} critical items pending
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Health Gauge + Quick Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Overall Health Gauge */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Workspace Profile Health</CardTitle>
            <CardDescription>
              Aggregate deterministic score across all businesses in this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 flex flex-col items-center justify-center">
            <ScoreGauge score={averageScore} size={190} />
          </CardContent>
          <div className="p-4 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground text-center">
            Evaluates 6 weighted categories totaling 100 points.
          </div>
        </Card>

        {/* Right Column: Managed Profiles & Recent Audits */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Business Audits</CardTitle>
              <CardDescription>
                Direct access to recent diagnostic reports and recommendations.
              </CardDescription>
            </div>
            <Link href="/businesses">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            {auditList.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <Building2 className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
                <h4 className="text-base font-bold text-foreground">
                  No Audits Run Yet
                </h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Add your first local business profile or run our demo seeder to explore audit reports.
                </p>
                <div className="pt-2">
                  <Link href="/onboarding">
                    <Button variant="default" size="sm">
                      Add Your First Business
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {auditList.slice(0, 5).map((aud) => {
                  const scoreTheme = getScoreColor(aud.overallScore);
                  return (
                    <div
                      key={aud.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-extrabold ${scoreTheme.bg} ${scoreTheme.border} ${scoreTheme.text}`}
                        >
                          <span className="text-base leading-none">
                            {aud.overallScore}
                          </span>
                          <span className="text-[9px] uppercase font-bold opacity-80">
                            / 100
                          </span>
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/audits/${aud.id}`}
                            className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {aud.businessName}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{aud.primaryCategory}</span>
                            <span>•</span>
                            <span>{formatDate(aud.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/audits/${aud.id}`}>
                          <Button variant="secondary" size="sm" className="gap-1 text-xs">
                            <span>View Report</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Action Tasks Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Priority Optimization Tasks</CardTitle>
            <CardDescription>
              Immediate fixes required to elevate profile completeness and accuracy.
            </CardDescription>
          </div>
          <Link href="/recommendations">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <span>View All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingTasks.filter((t) => t.status === "pending").length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              All optimization recommendations are up to date!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTasks
                .filter((t) => t.status === "pending")
                .slice(0, 4)
                .map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-border/70 bg-card/60 hover:bg-card transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#111111] px-2 py-0.5 rounded-full">
                        {task.severity}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {task.businessName}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">
                      {task.title}
                    </h4>
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <span className="text-muted-foreground capitalize">
                        Effort: {task.effort}
                      </span>
                      <Link
                        href="/recommendations"
                        className="font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>Fix Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
