"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Play,
  ArrowRight,
  Trash2,
  ExternalLink,
  MapPin,
  Phone,
  Globe,
  Search,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getScoreColor } from "@/lib/utils";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [auditingId, setAuditingId] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    try {
      const res = await fetch("/api/businesses");
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.businesses || []);
      }
    } catch (err) {
      console.error("Failed to load businesses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleRunAudit = async (businessId: string) => {
    setAuditingId(businessId);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, dataSource: "manual" }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/audits/${data.auditId}`;
      }
    } catch (err) {
      console.error("Audit run error:", err);
    } finally {
      setAuditingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action will permanently remove all associated audit records.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/businesses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBusinesses(businesses.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filtered = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.primaryCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.city && b.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Managed Business Profiles
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit and manage Google Business Profiles across your organization or client portfolio.
          </p>
        </div>

        <Link href="/businesses/new">
          <Button variant="default" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Business</span>
          </Button>
        </Link>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, category, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Business List */}
      {isLoading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading business profiles...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                {searchQuery ? "No matching businesses found" : "No business profiles registered"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? "Try searching for a different name, category, or locality."
                  : "Add your first business profile to run deterministic audits and generate recommendations."}
              </p>
            </div>
            {!searchQuery && (
              <div className="pt-2">
                <Link href="/businesses/new">
                  <Button variant="default">Create Business Profile</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((biz) => {
            const auditScore = biz.latestAudit?.overallScore;
            const scoreTheme = auditScore !== undefined ? getScoreColor(auditScore) : null;

            return (
              <Card key={biz.id} className="overflow-hidden hover:border-border transition-all flex flex-col justify-between">
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <Badge variant="outline" className="text-[11px] font-semibold">
                          {biz.primaryCategory}
                        </Badge>
                        <h3 className="text-base font-bold text-foreground truncate">
                          {biz.name}
                        </h3>
                        {biz.city && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>
                              {biz.city}, {biz.state || biz.country}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Latest Score Badge */}
                      {auditScore !== undefined ? (
                        <div
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border shrink-0 text-center ${scoreTheme?.bg} ${scoreTheme?.border} ${scoreTheme?.text}`}
                        >
                          <span className="text-xl font-black leading-none">{auditScore}</span>
                          <span className="text-[9px] uppercase font-bold opacity-80">/ 100</span>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Not Audited
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-2 space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {biz.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{biz.phone}</span>
                        </span>
                      )}
                      {biz.website && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{biz.website.replace(/^https?:\/\//, "")}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/40 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                          Reviews
                        </span>
                        <span className="font-bold text-foreground">{biz.reviewCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                          Rating
                        </span>
                        <span className="font-bold text-foreground">
                          {biz.averageRating ? `${biz.averageRating} ★` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                          Photos
                        </span>
                        <span className="font-bold text-foreground">{biz.photosCount || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-border/50 bg-muted/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunAudit(biz.id)}
                      disabled={auditingId === biz.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      {auditingId === biz.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Auditing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Run Audit</span>
                        </>
                      )}
                    </button>

                    <Link href={`/businesses/${biz.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Details
                      </Button>
                    </Link>
                  </div>

                  <button
                    onClick={() => handleDelete(biz.id, biz.name)}
                    className="p-2 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors"
                    title="Delete Business Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
