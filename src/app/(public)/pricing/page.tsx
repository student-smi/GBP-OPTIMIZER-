import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { Check, Sparkles, Building2, Award, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  const plans = [
    {
      name: "Free Starter",
      price: "$0",
      description: "For small local storefronts auditing a single location.",
      features: [
        "1 Business Profile",
        "Deterministic 100-Point Audit Engine",
        "Category Health Breakdown",
        "Prioritized Action Checklist",
        "SSRF-Safe Website Analysis",
        "Standard Community Support",
      ],
      cta: "Get Started Free",
      href: "/register",
      highlight: false,
    },
    {
      name: "Pro Optimizer",
      price: "$49",
      period: "/month",
      badge: "Most Popular",
      description: "For multi-location owners and dedicated SEO freelancers.",
      features: [
        "Up to 10 Business Locations",
        "Unlimited Automated Audits",
        "Full AI Content Generation Studio",
        "AI Review Reply Generator",
        "Historical Audit Progress Tracking",
        "Printable Client Audit Reports",
        "Priority Email Support",
      ],
      cta: "Start 14-Day Pro Trial",
      href: "/register",
      highlight: true,
    },
    {
      name: "Agency Suite",
      price: "$149",
      period: "/month",
      description: "For digital agencies and multi-location franchises.",
      features: [
        "Unlimited Business Profiles",
        "Client Workspace Management",
        "White-Label Printable PDF Reports",
        "Team Role-Based Access Control",
        "Bulk Audit Workflows",
        "API Integration Adapters (OAuth & Places)",
        "Dedicated Account Representative",
      ],
      cta: "Explore Agency Suite",
      href: "/register",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 space-y-16 py-12">
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#777777] uppercase tracking-widest">
            Predictable Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight max-w-3xl mx-auto">
            Plans for Owners, Freelancers & Agencies
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Choose the capacity that matches your local SEO auditing needs. All tiers feature our deterministic 100-point scoring model.
          </p>
        </section>

        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`relative flex flex-col justify-between transition-all ${
                  plan.highlight
                    ? "border-[#111111] shadow-none ring-1 ring-[#111111]"
                    : "border-border/80"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {plan.description}
                    </CardDescription>

                    <div className="pt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-xs text-muted-foreground font-semibold">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-2">
                    <div className="space-y-2.5 border-t border-border/50 pt-4 text-xs">
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>

                <div className="p-6 pt-0">
                  <Link href={plan.href}>
                    <Button
                      variant={plan.highlight ? "default" : "outline"}
                      className="w-full text-xs font-bold"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
