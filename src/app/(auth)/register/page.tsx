"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart2, Lock, Mail, User, Building, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "freelancer" | "agency_admin">("owner");
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          workspaceName: workspaceName || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register");
      }

      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-xl tracking-tight text-[#111111]">
            <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-white">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span>GBP Optimizer</span>
          </Link>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Create your account
          </h2>
          <p className="text-xs text-muted-foreground">
            Start auditing Google Business Profiles and generating optimization checklists.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] text-[#111111] text-xs font-semibold">
            {error}
          </div>
        )}

        <Card className="shadow-lg border-border/80">
          <CardContent className="p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Password (min. 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setRole("owner")}
                    className={`py-2 px-1 rounded-xl font-semibold border text-center transition-all ${
                      role === "owner"
                        ? "border-[#111111] bg-[#111111] text-white font-bold"
                        : "border-[#E5E5E5] bg-white text-[#666666] hover:text-[#111111]"
                    }`}
                  >
                    Business Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("freelancer")}
                    className={`py-2 px-1 rounded-xl font-semibold border text-center transition-all ${
                      role === "freelancer"
                        ? "border-[#111111] bg-[#111111] text-white font-bold"
                        : "border-[#E5E5E5] bg-white text-[#666666] hover:text-[#111111]"
                    }`}
                  >
                    SEO Freelancer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("agency_admin")}
                    className={`py-2 px-1 rounded-xl font-semibold border text-center transition-all ${
                      role === "agency_admin"
                        ? "border-[#111111] bg-[#111111] text-white font-bold"
                        : "border-[#E5E5E5] bg-white text-[#666666] hover:text-[#111111]"
                    }`}
                  >
                    Agency Admin
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Workspace / Agency Name (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Acme Marketing Co."
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full gap-2 mt-2"
                isLoading={isLoading}
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
