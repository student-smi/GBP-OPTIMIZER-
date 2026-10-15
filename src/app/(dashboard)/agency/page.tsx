import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db, initDatabase } from "@/db";
import { businesses, audits, workspaces, workspaceMembers, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";
import { getScoreColor, formatDate } from "@/lib/utils";
import {
  Users,
  Building2,
  FileCheck2,
  Printer,
  ShieldCheck,
  Plus,
  ArrowRight,
  ExternalLink,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AgencyHubPage() {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || !user.workspaceId) {
    redirect("/login");
  }

  // Fetch workspace details
  const wsRecords = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, user.workspaceId))
    .limit(1);

  const workspace = wsRecords[0];

  // Fetch all businesses under this workspace
  const bizList = await db
    .select()
    .from(businesses)
    .where(eq(businesses.workspaceId, user.workspaceId))
    .orderBy(desc(businesses.createdAt));

  // Fetch all audits
  const auditList = await db
    .select({
      id: audits.id,
      businessId: audits.businessId,
      overallScore: audits.overallScore,
      coveragePercentage: audits.coveragePercentage,
      createdAt: audits.createdAt,
      businessName: businesses.name,
      primaryCategory: businesses.primaryCategory,
      city: businesses.city,
    })
    .from(audits)
    .innerJoin(businesses, eq(audits.businessId, businesses.id))
    .where(eq(audits.workspaceId, user.workspaceId))
    .orderBy(desc(audits.createdAt));

  // Fetch workspace team members
  const members = await db
    .select({
      id: workspaceMembers.id,
      role: workspaceMembers.role,
      userName: users.name,
      email: users.email,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, user.workspaceId));

  return (
    <div className="space-y-8">
      {/* Agency Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-[#E5E5E5] shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5] text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Agency & Freelancer Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            {workspace?.name || "Client Workspaces"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Multi-location management, client audit histories, white-label printable reports, and team permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/businesses/new">
            <Button variant="default" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Client Location</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card>
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Client Locations
            </span>
            <div className="text-3xl font-black text-foreground mt-2">
              {bizList.length}
            </div>
            <span className="text-xs text-muted-foreground">Active business profiles</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Client Reports Generated
            </span>
            <div className="text-3xl font-black text-foreground mt-2">
              {auditList.length}
            </div>
            <span className="text-xs text-muted-foreground">Available for export & print</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Agency Team Members
            </span>
            <div className="text-3xl font-black text-foreground mt-2">
              {members.length}
            </div>
            <span className="text-xs text-muted-foreground">Workspace collaborators</span>
          </CardContent>
        </Card>
      </div>

      {/* Client Audit Portfolio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Audit Portfolio</CardTitle>
            <CardDescription>
              Recent audits across all client locations. Export professional printable reports.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {auditList.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No client audits available yet.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {auditList.map((aud) => {
                const scoreTheme = getScoreColor(aud.overallScore);
                return (
                  <div
                    key={aud.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-bold text-base shrink-0 ${scoreTheme.bg} ${scoreTheme.border} ${scoreTheme.text}`}
                      >
                        <span>{aud.overallScore}</span>
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={`/audits/${aud.id}`}
                          className="text-base font-bold text-foreground hover:text-primary transition-colors block truncate"
                        >
                          {aud.businessName}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{aud.primaryCategory}</span>
                          <span>•</span>
                          <span>{aud.city || "Location"}</span>
                          <span>•</span>
                          <span>{formatDate(aud.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Link href={`/audits/${aud.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          View Analysis
                        </Button>
                      </Link>
                      <Link href={`/reports/${aud.id}`} target="_blank">
                        <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                          <Printer className="w-3.5 h-3.5" />
                          <span>Export Client PDF</span>
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

      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Collaborators & Roles</CardTitle>
          <CardDescription>
            Members authorized to audit businesses and manage client deliverables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {members.map((member) => (
              <div key={member.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground">{member.userName}</span>
                  <span className="text-xs text-muted-foreground block">{member.email}</span>
                </div>
                <Badge variant="outline" className="capitalize text-xs">
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
