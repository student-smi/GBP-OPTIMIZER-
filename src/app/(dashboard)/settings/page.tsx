import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db, initDatabase } from "@/db";
import { integrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  Settings,
  Shield,
  Key,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  await initDatabase();
  const params = searchParams ? await searchParams : {};

  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasPlacesKey = Boolean(process.env.GOOGLE_PLACES_API_KEY);
  const hasOAuth = Boolean(process.env.GOOGLE_CLIENT_ID);

  // Check active Google OAuth integration
  const activeGoogleInt = await db
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

  const isGoogleConnected = activeGoogleInt.length > 0;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Workspace Settings & Integrations
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account credentials, security preferences, and external Google API connectors.
        </p>
      </div>

      {params.success === "google_connected" && (
        <div className="p-4 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] text-[#111111] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#111111]" />
          <span>Google Business Profile Account successfully authorized and connected!</span>
        </div>
      )}

      {params.error && (
        <div className="p-4 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] text-[#111111] text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#111111]" />
          <span>Google connection failed or was cancelled. Please check your OAuth configuration.</span>
        </div>
      )}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#111111]" />
            <CardTitle>Account Details</CardTitle>
          </div>
          <CardDescription>Your personal profile and authorization role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground block">Full Name</span>
              <span className="text-sm font-bold text-foreground">{user.name}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground block">Email Address</span>
              <span className="text-sm font-bold text-foreground">{user.email}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground block">Account Role</span>
              <span className="text-sm font-bold text-foreground capitalize">
                {user.role.replace("_", " ")}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground block">Workspace ID</span>
              <span className="text-xs font-mono text-muted-foreground truncate block">
                {user.workspaceId}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Integrations Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#111111]" />
              <CardTitle>External Google Services & APIs</CardTitle>
            </div>
            <CardDescription>
              Configure optional external services. The platform remains 100% functional via deterministic fallback when APIs are disconnected.
            </CardDescription>
          </div>
          <Link href="/integrations">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 shrink-0">
              <span>Diagnostics & Testing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Gemini AI */}
          <div className="p-4 rounded-xl border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#111111]" />
                <h4 className="text-sm font-bold text-foreground">
                  Google Gemini API (LLM Content Studio)
                </h4>
                {hasGeminiKey ? (
                  <Badge variant="default" className="text-[10px]">
                    Live Key Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    Deterministic Fallback
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Powers AI studio generation. When unconfigured, the system automatically uses our built-in template engine.
              </p>
            </div>

            <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-lg shrink-0">
              GEMINI_API_KEY
            </span>
          </div>

          {/* Google Places API */}
          <div className="p-4 rounded-xl border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#111111]" />
                <h4 className="text-sm font-bold text-foreground">
                  Google Places API (Business Discovery)
                </h4>
                {hasPlacesKey ? (
                  <Badge variant="default" className="text-[10px]">
                    Live Key Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    Manual Entry Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Enables place search and business discovery. Protected by server-side key restrictions.
              </p>
            </div>

            <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-lg shrink-0">
              GOOGLE_PLACES_API_KEY
            </span>
          </div>

          {/* Google OAuth 2.0 & GBP APIs */}
          <div className="p-4 rounded-xl border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#111111]" />
                <h4 className="text-sm font-bold text-foreground">
                  Official Google OAuth 2.0 & Business Profile APIs
                </h4>
                {isGoogleConnected ? (
                  <Badge variant="default" className="text-[10px]">
                    Connected & Authorized
                  </Badge>
                ) : hasOAuth ? (
                  <Badge variant="secondary" className="text-[10px]">
                    Credentials Configured
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    Not Configured
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Allows connecting verified Google Business Profile accounts to read reviews and sync location data.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasOAuth ? (
                <a href="/api/auth/google">
                  <Button variant="default" size="sm" className="text-xs gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>{isGoogleConnected ? "Reconnect Google" : "Connect Google Account"}</span>
                  </Button>
                </a>
              ) : (
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-lg shrink-0">
                  GOOGLE_CLIENT_ID
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
