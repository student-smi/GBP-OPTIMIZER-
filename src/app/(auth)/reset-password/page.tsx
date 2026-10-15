"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BarChart2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-white">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="text-[#111111]">GBP Optimizer</span>
          </Link>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Reset your password
          </h2>
          <p className="text-xs text-muted-foreground">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        <Card className="shadow-lg border-border/80">
          <CardContent className="p-6">
            {isSubmitted ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#111111] mx-auto" />
                <h3 className="text-base font-bold text-foreground">Check your inbox</h3>
                <p className="text-xs text-muted-foreground">
                  If an account exists for <strong className="text-foreground">{email}</strong>, we have dispatched a secure password reset link.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Return to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <Button type="submit" variant="default" className="w-full gap-2">
                  <span>Send Recovery Instructions</span>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
