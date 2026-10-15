import React from "react";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: October 2026 • Effective immediately
            </p>
          </div>

          <div className="prose dark:prose-invert text-xs leading-relaxed space-y-4 text-muted-foreground">
            <h3 className="text-sm font-bold text-foreground">1. Data Architecture & Tenant Isolation</h3>
            <p>
              GBP Optimizer is architected with strict multi-tenant isolation. Every query to our database enforces strict workspace-level checks to prevent Insecure Direct Object References (IDOR). No user can access or view another user&apos;s business profile records, audits, or reports without explicit workspace membership authorization.
            </p>

            <h3 className="text-sm font-bold text-foreground">2. Cryptographic Security Standards</h3>
            <p>
              We never store plaintext passwords. Passwords are cryptographically derived using WebCrypto PBKDF2 with 100,000 iterations and 16-byte random salts. Session tokens are 256-bit random strings transmitted exclusively via HTTP-only, secure, SameSite cookies.
            </p>

            <h3 className="text-sm font-bold text-foreground">3. Google Business Profile & Places Data</h3>
            <p>
              When official Google integrations are activated, credentials and tokens are encrypted and handled strictly server-side. We request only least-privilege permissions necessary to retrieve business profile metadata and reviews. We never sell, lease, or share your business records.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
