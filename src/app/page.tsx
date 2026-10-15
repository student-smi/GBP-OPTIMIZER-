import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import {
  BarChart2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  FileText,
  Star,
  Camera,
  Globe,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <Navbar />

      <main className="flex-1 space-y-20 py-12 md:py-16">
        {/* Hero Section */}
        <section className="container mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
            <span>Deterministic 100-Point Audit Engine for Google Business Profiles</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#111111] tracking-tight max-w-3xl mx-auto leading-[1.08]">
            Identify Optimization Gaps in Your Google Business Profile
          </h1>

          <p className="text-sm sm:text-base text-[#666666] max-w-2xl mx-auto leading-relaxed">
            Audit profile completeness, fix category inaccuracies, automate review responses, and deliver client-ready SEO reports with an objective, testable scoring system.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button variant="default" size="lg" className="w-full sm:w-auto gap-2">
                <span>Start Free Audit</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                <span>How It Works</span>
              </Button>
            </a>
          </div>

          {/* Minimalist Hero Score Preview Card (90% White / 10% Black) */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="p-6 md:p-8 rounded-2xl border border-[#E5E5E5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
              <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#F0F0F0] pb-6 md:pb-0 md:pr-6">
                <ScoreGauge score={84} size={170} />
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#111111]">
                      Apex Precision Plumbing & HVAC
                    </h3>
                    <p className="text-xs text-[#777777]">
                      Austin, TX • Verified Storefront Location
                    </p>
                  </div>
                  <Badge variant="default">84 / 100 Health</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-between font-medium text-[#111111]">
                    <span>Profile Completeness & Hours</span>
                    <span className="font-bold">30 / 30 pts (100%)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-between font-medium text-[#111111]">
                    <span>Reviews & Reply Coverage (3 unanswered)</span>
                    <span className="font-bold">11 / 15 pts (73%)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-between font-medium text-[#111111]">
                    <span>Visual Inventory: Missing Exterior Storefront Media</span>
                    <span className="font-bold">6 / 10 pts (60%)</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-[#666666]">
                  <span>3 prioritized tasks generated</span>
                  <Link href="/register" className="text-[#111111] font-bold hover:underline flex items-center gap-1">
                    <span>Audit your business</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What GBP Optimization Means & Why It Matters */}
        <section id="how-it-works" className="container mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#111111] uppercase tracking-widest">
              Simple 4-Step Journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#111111] tracking-tight">
              How the Audit & Optimization Process Works
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] max-w-xl mx-auto">
              You do not need to connect a Google account just to understand your profile health. Add your business manually or via search to get started immediately.
            </p>
          </div>

          {/* 4 Process Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-[#E5E5E5] bg-white">
              <CardContent className="p-5 space-y-2.5">
                <span className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-black text-xs">
                  1
                </span>
                <h3 className="text-sm font-bold text-[#111111]">Find Your Business</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Search via Google Places API or enter details manually. Works 100% reliably even without API credentials.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E5E5E5] bg-white">
              <CardContent className="p-5 space-y-2.5">
                <span className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-black text-xs">
                  2
                </span>
                <h3 className="text-sm font-bold text-[#111111]">Deterministic Audit</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Our engine evaluates 30+ rules across 6 core pillars, calculating an exact score out of 100 based on verified data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E5E5E5] bg-white">
              <CardContent className="p-5 space-y-2.5">
                <span className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-black text-xs">
                  3
                </span>
                <h3 className="text-sm font-bold text-[#111111]">Inspect & Fix Gaps</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Click &apos;View Fix&apos; on any finding to see why it matters, step-by-step action instructions, and copyable content suggestions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E5E5E5] bg-white">
              <CardContent className="p-5 space-y-2.5">
                <span className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-black text-xs">
                  4
                </span>
                <h3 className="text-sm font-bold text-[#111111]">AI Studio & Reports</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Generate SEO descriptions and review replies with Gemini AI, then export clean printable PDF reports for clients.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Value Proposition Cards: What it means & Why businesses need it */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-[#F7F7F7] border border-[#E5E5E5] space-y-2">
              <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#111111]" />
                <span>What Google Business Profile Optimization Means</span>
              </h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                GBP Optimization is the systematic process of verifying and enhancing every attribute of your Google listing — from accurate NAP (Name, Address, Phone) and category hierarchy to review response velocity and high-quality photography — ensuring maximum prominence in Google Maps and the Local 3-Pack.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F7F7] border border-[#E5E5E5] space-y-2">
              <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#111111]" />
                <span>Why Local Businesses Need Optimization</span>
              </h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                Over 76% of consumers searching for a local service on mobile visit a business within 24 hours. Profiles with missing descriptions, unanswered negative reviews, or generic categories lose customers to optimized competitors every single day.
              </p>
            </div>
          </div>
        </section>

        {/* 6 Category Pillar Grid */}
        <section className="container mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#111111] uppercase tracking-widest">
              Objective 100-Point Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
              6 Core Pillars of Profile Optimization
            </h2>
            <p className="text-xs text-[#666666] max-w-lg mx-auto">
              Every point is calculated from explicit, documented audit rules — no black-box algorithms or arbitrary numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Pillar 1 */}
            <Card className="hover:border-[#111111] transition-colors">
              <CardContent className="p-5 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111111]">
                    Profile Completeness
                  </h3>
                  <Badge variant="secondary">30 pts</Badge>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Evaluates presence of core fields: business name, primary category, address, phone, website, operating hours, description, and itemized services.
                </p>
              </CardContent>
            </Card>

            {/* Pillar 2 */}
            <Card className="hover:border-[#111111] transition-colors">
              <CardContent className="p-5 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111111]">
                    Information Accuracy
                  </h3>
                  <Badge variant="secondary">20 pts</Badge>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Checks phone dialability, SSL security protocols (HTTPS), keyword stuffing flags, formatting consistency, and description guidelines.
                </p>
              </CardContent>
            </Card>

            {/* Pillar 3 */}
            <Card className="hover:border-[#111111] transition-colors">
              <CardContent className="p-5 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111111]">
                    Categories & Services
                  </h3>
                  <Badge variant="secondary">15 pts</Badge>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Evaluates primary category specificity (flags generic classifications like &apos;Store&apos;), secondary category depth (1–9 max), and service descriptions.
                </p>
              </CardContent>
            </Card>

            {/* Pillar 4 */}
            <Card className="hover:border-[#111111] transition-colors">
              <CardContent className="p-5 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold">
                  <Star className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111111]">
                    Reviews Management
                  </h3>
                  <Badge variant="secondary">15 pts</Badge>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Analyzes total review volume against local benchmarks, average star ratings, and response coverage on unanswered customer reviews.
                </p>
              </CardContent>
            </Card>

            {/* Pillar 5 */}
            <Card className="hover:border-[#111111] transition-colors">
              <CardContent className="p-5 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111111]">
                    Photos & Visual Content
                  </h3>
                  <Badge variant="secondary">10 pts</Badge>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Checks photo inventory sufficiency, exterior storefront and signage media, interior atmosphere, and authentic team photography.
                </p>
              </CardContent>
            </Card>

            {/* Pillar 6 */}
            <Card className="hover:border-[#111111] transition-colors">
              <CardContent className="p-5 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111111]">
                    Website & Local SEO
                  </h3>
                  <Badge variant="secondary">10 pts</Badge>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  SSRF-safe website inspection verifying public landing page accessibility, HTTPS security, title tags, and meta descriptions.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Persona Section */}
        <section className="container mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
              Designed for Business Owners, Freelancers & Agencies
            </h2>
            <p className="text-xs text-[#666666] max-w-md mx-auto">
              Role-based workspace isolation ensures complete data privacy across organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card>
              <CardContent className="p-5 space-y-2">
                <Building2 className="w-6 h-6 text-[#111111]" />
                <h3 className="text-sm font-bold text-[#111111]">Local Business Owners</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Audit your storefront, identify missing information, use AI studio to write descriptions and review replies, and track checklist progress.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-2">
                <Award className="w-6 h-6 text-[#111111]" />
                <h3 className="text-sm font-bold text-[#111111]">SEO Freelancers</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Manage multiple independent client audits, produce white-label executive printable reports, and track outstanding deliverables.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-2">
                <Layers className="w-6 h-6 text-[#111111]" />
                <h3 className="text-sm font-bold text-[#111111]">Digital Marketing Agencies</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Organize multiple client accounts in dedicated workspaces, audit multi-location franchise brands, and export branded PDF deliverables.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Clean Monochrome CTA Section */}
        <section className="container mx-auto max-w-4xl px-4 text-center">
          <div className="p-8 sm:p-12 rounded-2xl border border-[#E5E5E5] bg-[#F7F7F7] space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
              Start Auditing Your Google Business Profile
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] max-w-lg mx-auto">
              Complete database persistence, deterministic scoring, AI content studio, and printable client reports.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/register">
                <Button variant="default" size="lg">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  1-Click Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
