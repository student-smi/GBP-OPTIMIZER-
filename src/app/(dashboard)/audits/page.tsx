import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db, initDatabase } from "@/db";
import { audits, businesses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";
import { getScoreColor, formatDateTime } from "@/lib/utils";
import {
  FileSearch,
  Building2,
  Printer,
  ArrowRight,
  ShieldCheck,
  Play,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AuditsPage() {
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
    })
    .from(audits)
    .innerJoin(businesses, eq(audits.businessId, businesses.id))
    .where(eq(audits.workspaceId, user.workspaceId))
    .orderBy(desc(audits.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Audit History & Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review past diagnostic evaluations, track score improvements, and export client reports.
          </p>
        </div>

        <Link href="/businesses">
          <Button size="sm" className="gap-1.5 font-semibold">
            <Play className="w-3.5 h-3.5" />
            <span>Run New Audit</span>
          </Button>
        </Link>
      </div>

      {auditList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No Audits Run Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add your first business and execute a deterministic GBP audit to generate diagnostic scores and optimization plans.
            </p>
            <Link href="/onboarding">
              <Button size="sm" className="mt-2">
                Add Business & Run Audit
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
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
                        / 100
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {aud.businessName}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {aud.businessCategory}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          #{aud.id.substring(4, 12)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateTime(aud.createdAt)}</span>
                        </span>
                        <span>•</span>
                        <span>Source: <strong className="text-foreground capitalize">{aud.dataSource.replace("_", " ")}</strong></span>
                        <span>•</span>
                        <span>Coverage: <strong className="text-foreground">{aud.coveragePercentage}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link href={`/audits/${aud.id}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5">
                        <span>Inspect Findings</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>

                    <Link href={`/reports/${aud.id}`} target="_blank">
                      <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
