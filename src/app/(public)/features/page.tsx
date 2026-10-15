import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import {
  FileText,
  CheckCircle2,
  Tags,
  Star,
  Camera,
  Globe,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
  const pillars = [
    {
      title: "1. Profile Completeness",
      weight: "30 Points (30%)",
      icon: FileText,
      color: "text-[#111111]",
      description:
        "Validates presence of core fields required for Google Maps indexing and user conversion.",
      rules: [
        "Business Name validation (exact official trading name)",
        "Primary Category selection from approved taxonomy",
        "Physical storefront address or service-area radius declaration",
        "Direct local phone contact for one-tap calling",
        "Secure website link for organic authority reinforcement",
        "Complete weekly operating hours schedule with open/close times",
        "Engaging 500+ character business narrative",
        "Itemized services catalog enabling search justifications",
        "Featured products showcase carousel",
      ],
    },
    {
      title: "2. Business Information Accuracy",
      weight: "20 Points (20%)",
      icon: CheckCircle2,
      color: "text-[#111111]",
      description:
        "Ensures information adheres to Google guidelines, telecom dial standards, and security protocols.",
      rules: [
        "Standardized E.164 phone formatting with area codes",
        "HTTPS protocol enforcement on connected websites",
        "Sentence-case formatting in descriptions (flags spammy ALL CAPS)",
        "Prohibition of raw URLs or phone numbers inside description text",
        "City and postal code granularity for pin geocoding accuracy",
        "Keyword stuffing detection in business titles",
      ],
    },
    {
      title: "3. Categories & Services Relevance",
      weight: "15 Points (15%)",
      icon: Tags,
      color: "text-[#111111]",
      description:
        "Sharpens algorithmic relevance for primary revenue searches and secondary offerings.",
      rules: [
        "Primary category specificity (flags generic categories like 'Store' or 'Company')",
        "Recommended 2 to 5 secondary categories (up to 9 maximum)",
        "Prevention of category bloat (>9 secondary categories)",
        "Granular service item labeling with descriptive titles",
      ],
    },
    {
      title: "4. Reviews Management",
      weight: "15 Points (15%)",
      icon: Star,
      color: "text-[#111111]",
      description:
        "Analyzes social proof metrics and customer engagement responsiveness.",
      rules: [
        "Review volume threshold benchmarks (target >= 25 reviews)",
        "Average star rating evaluation (target >= 4.5 stars)",
        "Merchant response rate monitoring (aim for 90%+ reply coverage)",
        "Unanswered review backlog identification",
      ],
    },
    {
      title: "5. Photos & Visual Content",
      weight: "10 Points (10%)",
      icon: Camera,
      color: "text-[#111111]",
      description:
        "Quantifies visual assets that drive directions requests and click-through rates.",
      rules: [
        "Total photo inventory count (target >= 20 photos)",
        "Daytime exterior storefront and signage photo verification",
        "Interior atmosphere and customer welcome area media",
        "Authentic team and staff photography",
      ],
    },
    {
      title: "6. Website & Local SEO",
      weight: "10 Points (10%)",
      icon: Globe,
      color: "text-[#111111]",
      description:
        "SSRF-safe server-side website inspection verifying organic search synergy.",
      rules: [
        "Server-side request forgery (SSRF) safe public URL check",
        "Detection of custom branded domain vs. free social subdomains",
        "Homepage <title> tag presence and length optimization",
        "Meta description presence and character count",
        "Single primary <h1> heading structure check",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 space-y-16 py-12">
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#777777] uppercase tracking-widest">
            Audit Engine Specification
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight max-w-3xl mx-auto">
            Transparent, Testable Audit Rules
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Our audit engine executes 30+ deterministic tests across 6 core pillars, generating actionable recommendations with clear evidence.
          </p>
        </section>

        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <Card key={idx} className="border-border/80 hover:border-border transition-all">
                  <CardContent className="p-6 sm:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-muted ${pillar.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">
                          {pillar.title}
                        </h2>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted text-foreground">
                        {pillar.weight}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>

                    <div className="pt-2 border-t border-border/40 space-y-2">
                      <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                        Evaluated Rules:
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {pillar.rules.map((rule, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto max-w-4xl px-4 text-center py-6">
          <div className="p-8 rounded-3xl bg-muted/30 border border-border space-y-4">
            <h3 className="text-xl font-bold text-foreground">
              Ready to run your first profile audit?
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Test your Google Business Profile against our complete deterministic rule set.
            </p>
            <div className="pt-2">
              <Link href="/register">
                <Button variant="default" className="gap-2">
                  <span>Start Audit</span>
                  <ArrowRight className="w-4 h-4" />
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
