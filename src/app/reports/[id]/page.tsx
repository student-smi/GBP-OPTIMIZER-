import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db, initDatabase } from "@/db";
import { audits, businesses, auditCategoryScores, auditFindings, recommendations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { formatDate, formatDateTime, getScoreColor, getSeverityBadge } from "@/lib/utils";
import {
  BarChart2,
  Printer,
  ArrowLeft,
  Building2,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/audit/print-button";

export const dynamic = "force-dynamic";

export default async function PrintableReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await initDatabase();
  const { id } = await params;

  // Retrieve audit
  const auditRecords = await db.select().from(audits).where(eq(audits.id, id)).limit(1);
  if (auditRecords.length === 0) {
    notFound();
  }
  const audit = auditRecords[0];

  // Retrieve business
  const bizRecords = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, audit.businessId))
    .limit(1);
  const business = bizRecords[0] || null;

  // Retrieve category scores
  const categoryScores = await db
    .select()
    .from(auditCategoryScores)
    .where(eq(auditCategoryScores.auditId, id));

  // Retrieve findings
  const findings = await db
    .select()
    .from(auditFindings)
    .where(eq(auditFindings.auditId, id));

  // Retrieve recommendations
  const recs = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.auditId, id));

  const scoreTheme = getScoreColor(audit.overallScore);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:p-0">
      {/* Top Floating Print Controls (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print">
        <Link
          href={`/audits/${audit.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Interactive Audit</span>
        </Link>

        <PrintButton />
      </div>

      {/* Main Document Body */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm space-y-10 print:border-none print:shadow-none print:p-6 print:rounded-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8 print:pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#111111] font-bold text-sm tracking-tight mb-1">
              <BarChart2 className="w-5 h-5" />
              <span>GBP OPTIMIZER AUDIT SUITE</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
              Google Business Profile Audit Report
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Deterministic 100-Point Quality, Accuracy, and Local SEO Completeness Assessment
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 dark:text-slate-400 space-y-1 shrink-0">
            <div>
              <strong>Audit Date:</strong> {formatDate(audit.auditTimestamp)}
            </div>
            <div>
              <strong>Audit ID:</strong> <span className="font-mono">{audit.id.substring(4, 12)}</span>
            </div>
            <div>
              <strong>Data Source:</strong>{" "}
              <span className="capitalize font-semibold">{audit.dataSource.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {/* Business Profile Meta Card */}
        {business && (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:bg-slate-50 print:border-slate-300">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
                Audited Location Profile
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white print:text-black">
                {business.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Primary Category: <strong>{business.primaryCategory}</strong> •{" "}
                {business.address ? `${business.address}, ` : ""}
                {business.city ? `${business.city}, ` : ""}
                {business.state || business.country}
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              <div>
                Website: <strong>{business.website || "None"}</strong>
              </div>
              <div>
                Phone: <strong>{business.phone || "None"}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Executive Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-slate-200 dark:border-slate-800 pb-10">
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 text-center print:bg-slate-50">
            <span className="text-xs font-bold uppercase text-slate-500 mb-2">
              Overall Profile Health Index
            </span>
            <div
              className={`text-6xl font-black leading-none mb-2 ${scoreTheme.text}`}
            >
              {audit.overallScore}
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              out of 100 points
            </span>
            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${scoreTheme.badge}`}>
              {scoreTheme.label}
            </div>
          </div>

          <div className="md:col-span-7 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white print:text-black">
              Category Score Matrix
            </h3>
            <div className="space-y-2">
              {categoryScores.map((cat) => {
                const pct = Math.round((cat.score / cat.maxScore) * 100);
                return (
                  <div key={cat.categoryKey} className="text-xs">
                    <div className="flex justify-between font-semibold mb-1">
                      <span>{cat.categoryName}</span>
                      <span>
                        {cat.score} / {cat.maxScore} pts ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-[#111111] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Prioritized Findings & Corrective Actions */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white print:text-black">
              Detailed Findings & Actionable Recommendations ({findings.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identified gaps ordered by ranking and conversion severity.
            </p>
          </div>

          <div className="space-y-4">
            {findings.map((f, index) => {
              const rec = recs.find((r) => r.findingId === f.id);
              const badge = getSeverityBadge(f.severity as any);

              return (
                <div
                  key={f.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3 print:bg-white print:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        #{index + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                        {badge.label}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white print:text-black">
                        {f.title}
                      </h4>
                    </div>

                    <span className="text-xs font-bold text-[#111111] bg-[#F5F5F5] px-2 py-0.5 rounded border border-[#CCCCCC]">
                      -{f.deduction} pts
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {f.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Evidence: {f.evidence}
                  </div>

                  {rec && (
                    <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] text-xs space-y-1">
                      <div className="flex items-center gap-1 font-bold text-[#111111]">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Recommended Corrective Action:</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200">
                        {rec.actionSteps}
                      </p>
                      <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-4">
                        <span>Expected Impact: {rec.expectedBenefit}</span>
                        <span>Effort: <strong className="capitalize">{rec.effort}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong>Official Search Ranking Disclaimer:</strong> This audit report evaluates Google Business Profile completeness, accuracy, and best practices. Implementing these recommendations helps improve customer trust, brand clarity, and profile completeness. No software or consultant can guarantee specific top Google Maps rankings, as search algorithms factor in proximity, organic authority, user behavior, and competition.
          </p>
          <p className="text-right text-[10px]">
            Generated by GBP Optimizer SaaS • Client Confidential
          </p>
        </div>
      </div>
    </div>
  );
}
