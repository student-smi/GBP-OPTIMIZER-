"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart2, Mail, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") || "";

  const [code, setCode] = useState("729415");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam, code }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/onboarding");
        }, 1200);
      } else {
        setError(data.error || "Verification failed. Check the code and try again.");
      }
    } catch {
      setError("Network error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-xl tracking-tight text-[#111111]">
          <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-white">
            <BarChart2 className="w-4 h-4" />
          </div>
          <span>GBP Optimizer</span>
        </Link>
        <h2 className="text-2xl font-black text-[#111111] tracking-tight">
          Verify Your Email
        </h2>
        <p className="text-xs text-[#666666]">
          We sent a 6-digit confirmation code to{" "}
          <strong className="text-[#111111]">{emailParam || "your email address"}</strong>.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] text-[#111111] text-xs font-semibold">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="p-4 rounded-xl bg-[#F5F5F5] border border-[#111111] text-[#111111] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#111111]" />
          <span>Email successfully verified! Directing to onboarding wizard...</span>
        </div>
      )}

      <Card className="border border-[#E5E5E5] bg-white shadow-none">
        <CardContent className="p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#111111] block text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full tracking-widest text-center text-xl font-mono py-3 rounded-xl border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]"
                />
              </div>
              <p className="text-[11px] text-[#777777] text-center">
                Demo code pre-filled for rapid testing.
              </p>
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full gap-2 mt-2"
              isLoading={isVerifying}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Continue to Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="pt-4 border-t border-[#E5E5E5] mt-4 text-center">
            <button
              type="button"
              onClick={() => alert("Verification code re-sent to your inbox.")}
              className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#111111] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Didn&apos;t receive code? Resend code</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <Suspense fallback={<div className="text-xs text-[#666666]">Loading verification...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
