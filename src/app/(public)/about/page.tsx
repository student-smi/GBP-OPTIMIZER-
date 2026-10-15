import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { ShieldCheck, BarChart2, Layers, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 space-y-16 py-12">
        <section className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <span className="text-xs font-bold text-[#777777] uppercase tracking-widest">
            Our Architecture & Values
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight max-w-3xl mx-auto">
            Honest, Objective Auditing for Local Business Profiles
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We built GBP Optimizer because local businesses deserve transparent diagnostic tools without deceptive ranking guarantees, fake automated metrics, or unauthorized web scraping.
          </p>
        </section>

        <section className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#111111]" />
                <h3 className="text-base font-bold text-foreground">
                  Deterministic & Testable Rules
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our 100-point scoring model is computed from explicit, tested rules across 6 core pillars. We never present arbitrary AI hallucinations as verified audit findings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <Layers className="w-8 h-8 text-[#111111]" />
                <h3 className="text-base font-bold text-foreground">
                  Ethical Integration Strategy
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We distinguish between user-provided data, public sources, and officially connected accounts. We do not scrape Google Maps through unauthorized automation.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
