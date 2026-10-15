"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Play, Edit3, Key, Loader2, Sparkles, Printer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessActionBarProps {
  businessId: string;
  businessName: string;
  hasLatestAudit: boolean;
  latestAuditId?: string;
  isGoogleConnected: boolean;
}

export function BusinessActionBar({
  businessId,
  businessName,
  hasLatestAudit,
  latestAuditId,
  isGoogleConnected,
}: BusinessActionBarProps) {
  const router = useRouter();
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, dataSource: "manual" }),
      });

      const data = await res.json();
      if (res.ok && data.auditId) {
        router.push(`/audits/${data.auditId}`);
      } else {
        alert(data.error || "Failed to trigger audit");
        setIsRunningAudit(false);
      }
    } catch {
      alert("Failed to run audit");
      setIsRunningAudit(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 pt-3">
      {/* Action 1: Run GBP Audit */}
      <Button
        variant="default"
        size="sm"
        disabled={isRunningAudit}
        onClick={handleRunAudit}
        className="gap-2 shadow-sm font-semibold"
      >
        {isRunningAudit ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Evaluating 30+ Rules...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Run GBP Audit</span>
          </>
        )}
      </Button>

      {/* Action 2: Edit Business Information */}
      <Link href={`/businesses/${businessId}/edit`}>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Business Information</span>
        </Button>
      </Link>

      {/* Action 3: Connect Google Account (Optional) */}
      <a href="/api/auth/google">
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5 text-xs border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] hover:bg-[#EAEAEA]"
        >
          <Key className="w-3.5 h-3.5" />
          <span>{isGoogleConnected ? "Google Connected" : "Connect Google Account"}</span>
        </Button>
      </a>

      {hasLatestAudit && latestAuditId && (
        <Link href={`/reports/${latestAuditId}`} target="_blank">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-[#666666] hover:text-[#111111]">
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
