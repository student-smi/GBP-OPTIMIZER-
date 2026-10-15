import React from "react";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: October 2026 • Governing Terms
            </p>
          </div>

          <div className="text-xs leading-relaxed space-y-4 text-muted-foreground">
            <h3 className="text-sm font-bold text-foreground">1. Acceptance of Terms</h3>
            <p>
              By accessing or using GBP Optimizer, you agree to comply with and be bound by these Terms of Service. If you are entering into these terms on behalf of a digital agency or employer, you warrant that you have authority to bind that entity.
            </p>

            <h3 className="text-sm font-bold text-foreground">
              2. Ranking Disclaimer & Deterministic Audit Scope
            </h3>
            <p className="p-4 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] text-[#111111]">
              <strong>IMPORTANT DISCLAIMER:</strong> GBP Optimizer is an independent audit and productivity tool. We do not guarantee, claim, or promise that achieving a higher optimization score will result in higher Google Maps, Google Search, or Local 3-Pack rankings. Google search rankings depend on hundreds of dynamic factors outside any third-party tool&apos;s control, including physical user proximity, competitive market density, historical authority, and proprietary algorithm updates.
            </p>

            <h3 className="text-sm font-bold text-foreground">3. Ethical Profile Optimization</h3>
            <p>
              Users agree not to use GBP Optimizer to generate fraudulent customer reviews, spam Google categories, or engage in deceptive local naming practices that violate Google Business Profile content guidelines.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
