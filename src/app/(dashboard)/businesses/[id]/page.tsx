import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db, initDatabase } from "@/db";
import { businesses, audits, recommendations, businessLocations, integrations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";
import { getScoreColor, formatDate, formatDateTime } from "@/lib/utils";
import {
  Building2,
  ArrowLeft,
  Play,
  FileText,
  MapPin,
  Phone,
  Globe,
  Clock,
  Sparkles,
  Camera,
  Star,
  ExternalLink,
  Printer,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  ListTodo,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessActionBar } from "@/components/business/business-action-bar";

export const dynamic = "force-dynamic";

export default async function BusinessDetailPage({
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

  // Strict tenant check
  const bizRecords = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.id, id), eq(businesses.workspaceId, user.workspaceId)))
    .limit(1);

  if (bizRecords.length === 0) {
    notFound();
  }

  const biz = bizRecords[0];

  // Fetch active Google OAuth integration
  const googleIntegrationRecords = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.workspaceId, user.workspaceId),
        eq(integrations.provider, "google_oauth"),
        eq(integrations.isActive, true)
      )
    )
    .limit(1);
  const isGoogleConnected = googleIntegrationRecords.length > 0;

  // Fetch audit history
  const auditList = await db
    .select()
    .from(audits)
    .where(eq(audits.businessId, id))
    .orderBy(desc(audits.createdAt));

  const latestAudit = auditList[0] || null;
  const scoreTheme = latestAudit ? getScoreColor(latestAudit.overallScore) : null;

  // Fetch pending recommendations
  const tasks = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.businessId, id))
    .orderBy(desc(recommendations.updatedAt));

  const pendingTasksCount = tasks.filter((t) => t.status === "pending").length;

  const additionalCats: string[] = biz.additionalCategories
    ? JSON.parse(biz.additionalCategories)
    : [];
  const servicesList: string[] = biz.services ? JSON.parse(biz.services) : [];
  const productsList: string[] = biz.products ? JSON.parse(biz.products) : [];

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/businesses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Businesses</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {biz.primaryCategory}
              </Badge>
              {biz.isServiceAreaBusiness ? (
                <Badge variant="secondary" className="text-xs">
                  Service-Area Business
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Storefront Location
                </Badge>
              )}
              {isGoogleConnected ? (
                <Badge className="bg-[#111111] text-white text-xs gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Google Connected</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground gap-1 border-dashed">
                  <AlertCircle className="w-3 h-3" />
                  <span>Manual Profile</span>
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {biz.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              {biz.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {biz.address}, {biz.city}, {biz.state} {biz.postalCode}
                  </span>
                </span>
              )}
              {biz.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{biz.phone}</span>
                </span>
              )}
              {biz.website && (
                <a
                  href={biz.website.startsWith("http") ? biz.website : `https://${biz.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{biz.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Audit Score Card & Secondary Links */}
          <div className="flex items-center gap-4 shrink-0">
            {latestAudit && scoreTheme ? (
              <div
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center min-w-[120px] ${scoreTheme.bg} ${scoreTheme.border} ${scoreTheme.text}`}
              >
                <span className="text-3xl font-black">{latestAudit.overallScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  Score / 100
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground min-w-[120px]">
                No audit yet
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Link href="/ai-studio">
                <Button variant="secondary" size="sm" className="w-full gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
                  <span>AI Studio</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Status Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Connection Status
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5 block truncate">
              {isGoogleConnected ? "Google Connected" : "Manual (Unconnected)"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Last Audit Date
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5 block truncate">
              {latestAudit ? formatDateTime(latestAudit.createdAt) : "Never Audited"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Latest Audit Score
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5 block truncate">
              {latestAudit ? `${latestAudit.overallScore} / 100` : "Not Evaluated"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Pending Tasks
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5 block truncate">
              {pendingTasksCount} Tasks Pending
            </span>
          </div>
        </div>

        {/* 3 Prominent Actions */}
        <div className="pt-2 border-t border-border/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            Quick Actions
          </span>
          <BusinessActionBar
            businessId={biz.id}
            businessName={biz.name}
            hasLatestAudit={Boolean(latestAudit)}
            latestAuditId={latestAudit?.id}
            isGoogleConnected={isGoogleConnected}
          />
        </div>
      </div>

      {/* Tabs / Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Profile Information & Audits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Overview Details */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview & Inventory</CardTitle>
              <CardDescription>
                Publicly indexed business signals, descriptions, and media counts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {biz.description ? (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-sm leading-relaxed">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    Business Description ({biz.description.length} chars)
                  </div>
                  <p className="text-foreground">{biz.description}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] text-[#111111] text-xs font-semibold">
                  Missing business description. Profile loses critical keyword relevance and narrative engagement.
                </div>
              )}

              {/* Secondary Categories */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Secondary Categories ({additionalCats.length} / 9)
                </h4>
                {additionalCats.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {additionalCats.map((cat, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No secondary categories assigned.
                  </p>
                )}
              </div>

              {/* Services List */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Catalog Services ({servicesList.length})
                </h4>
                {servicesList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {servicesList.map((srv, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-medium"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No itemized services configured.
                  </p>
                )}
              </div>

              {/* Products List */}
              {productsList.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Featured Products ({productsList.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {productsList.map((prod, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5] text-xs font-medium"
                      >
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit History Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Historical Audits ({auditList.length})</CardTitle>
                <CardDescription>
                  Track progress over time as optimization recommendations are executed.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {auditList.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No audits recorded yet for this location.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {auditList.map((aud) => {
                    const theme = getScoreColor(aud.overallScore);
                    return (
                      <div
                        key={aud.id}
                        className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-sm border ${theme.bg} ${theme.border} ${theme.text}`}
                          >
                            <span>{aud.overallScore}</span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground">
                              Audit #{aud.id.substring(4, 10)}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              {formatDateTime(aud.createdAt)} • Source: {aud.dataSource}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/audits/${aud.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              Inspect Report
                            </Button>
                          </Link>
                          <Link href={`/reports/${aud.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs">
                              <Printer className="w-3.5 h-3.5" />
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

        {/* Right Col: Stats & Active Action Items */}
        <div className="space-y-6">
          {/* Metrics Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Reputation & Visuals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Star className="w-4 h-4 text-[#111111]" />
                  <span>Reviews & Rating</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">
                    {biz.reviewCount || 0} reviews
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    {((biz.averageRating || 0) / 10).toFixed(1)} ★ average
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Camera className="w-4 h-4 text-[#111111]" />
                  <span>Photo Gallery</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">
                    {biz.photosCount || 0} total photos
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    Ext: {biz.exteriorPhotos || 0} • Int: {biz.interiorPhotos || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Tasks Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Optimization Tasks</CardTitle>
              <Badge variant="outline">{tasks.length} total</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-border/60 bg-muted/20 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground truncate max-w-[180px]">
                      {t.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.severity === "critical"
                          ? "bg-[#111111] text-white"
                          : t.severity === "high"
                          ? "bg-[#444444] text-white"
                          : "bg-[#F0F0F0] text-[#111111] border border-[#CCCCCC]"
                      }`}
                    >
                      {t.severity}
                    </span>
                  </div>
                  <p className="text-muted-foreground truncate">{t.description}</p>
                </div>
              ))}

              <div className="pt-2">
                <Link href="/recommendations">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    View Complete Checklist
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
