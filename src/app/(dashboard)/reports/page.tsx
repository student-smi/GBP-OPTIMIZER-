import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db, initDatabase } from "@/db";
import { audits, businesses, recommendations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";
import { getScoreColor, formatDateTime } from "@/lib/utils";
import {
  Printer,
  FileText,
  Building2,
  Calendar,
  Share2,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ReportsIndexPage() {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    redirect("/login");
  }

  // Fetch audits with business information
  const auditList = await db
    .select({
      id: audits.id,
      businessId: audits.businessId,
      overallScore: audits.overallScore,
      coveragePercentage: audits.coveragePercentage,
      status: audits.status,
      dataSource: audits.dataSource,
      createdAt: audits.createdAt,
      businessName: businesses.name,
      businessCategory: businesses.primaryCategory,
      website: businesses.website,
    })
    .from(audits)
    .innerJoin(businesses, eq(audits.businessId, businesses.id))
    .where(eq(audits.workspaceId, user.workspaceId))
    .orderBy(desc(audits.createdAt));

  // Fetch recommendations count
  const allTasks = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.workspaceId, user.workspaceId));

  const completedTasks = allTasks.filter((t) => t.status === "completed").length;
  const pendingTasks = allTasks.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Client & Executive Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Export presentation-ready audit summaries, task roadmaps, and optimization deliverables.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Generated Reports
          </span>
          <span className="text-2xl font-black text-foreground mt-1 block">
            {auditList.length}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Available for instant print or PDF export
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Resolved Tasks
          </span>
          <span className="text-2xl font-black text-foreground mt-1 block">
            {completedTasks}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Completed optimization fixes
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Pending Recommendations
          </span>
          <span className="text-2xl font-black text-foreground mt-1 block">
            {pendingTasks}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Opportunities to improve profile health
          </span>
        </div>
      </div>

      {/* Reports Table / Card List */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="p-5 border-b border-border/60">
          <CardTitle>Available Audit Deliverables</CardTitle>
          <CardDescription>
            Each report is formatted with high contrast, white background, and print stylesheets. Note: Score improvements reflect profile completeness and guidelines compliance, not guaranteed search rankings.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {auditList.length === 0 ? (
            <div className="p-10 text-center text-xs text-muted-foreground">
              No audit reports available yet. Run an audit on any of your businesses to generate reports.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {auditList.map((aud) => {
                const theme = getScoreColor(aud.overallScore);
                return (
                  <div
                    key={aud.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-base border shrink-0 ${theme.bg} ${theme.border} ${theme.text}`}
                      >
                        <span>{aud.overallScore}</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-80 font-bold">
                          Score
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {aud.businessName}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {aud.businessCategory}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>Date: {formatDateTime(aud.createdAt)}</span>
                          <span>•</span>
                          <span>Source: <strong className="text-foreground capitalize">{aud.dataSource.replace("_", " ")}</strong></span>
                          <span>•</span>
                          <span>Coverage: <strong className="text-foreground">{aud.coveragePercentage}%</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link href={`/reports/${aud.id}`} target="_blank">
                        <Button size="sm" className="text-xs gap-1.5 font-semibold">
                          <Printer className="w-3.5 h-3.5" />
                          <span>View & Print PDF</span>
                        </Button>
                      </Link>

                      <Link href={`/audits/${aud.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Diagnostic View
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
  );
}
