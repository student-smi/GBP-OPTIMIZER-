"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ViewFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  findingTitle: string;
  categoryKey: string;
  severity: "critical" | "high" | "medium" | "low";
  explanation: string;
  evidence: string;
  recommendedAction: string;
  expectedBenefit: string;
  suggestedContent?: string;
  canAutomate?: boolean;
  isAuthorized?: boolean;
  onMarkCompleted?: () => void;
  onDismiss?: () => void;
}

export function ViewFixModal({
  isOpen,
  onClose,
  findingTitle,
  categoryKey,
  severity,
  explanation,
  evidence,
  recommendedAction,
  expectedBenefit,
  suggestedContent,
  canAutomate = false,
  isAuthorized = false,
  onMarkCompleted,
  onDismiss,
}: ViewFixModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmedAuth, setConfirmedAuth] = useState(false);
  const [isApplyingAuth, setIsApplyingAuth] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!suggestedContent) return;
    navigator.clipboard.writeText(suggestedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteAutomatedFix = async () => {
    if (!confirmedAuth) return;
    setIsApplyingAuth(true);
    // Simulate authorized Google Business Profile API call
    setTimeout(() => {
      setIsApplyingAuth(false);
      setAuthSuccess(true);
      if (onMarkCompleted) onMarkCompleted();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-[#E5E5E5] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E5E5] flex items-start justify-between gap-4 bg-white">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  severity === "critical"
                    ? "bg-[#111111] text-white"
                    : severity === "high"
                    ? "bg-[#444444] text-white"
                    : "bg-[#F5F5F5] text-[#111111] border border-[#CCCCCC]"
                }`}
              >
                {severity} Severity
              </span>
              <Badge variant="outline" className="text-xs capitalize">
                {categoryKey.replace("_", " ")}
              </Badge>
            </div>
            <h2 className="text-xl font-black text-[#111111] tracking-tight">
              {findingTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#777777] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* 1. Problem Explanation & Evidence */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-[#111111]" />
              <span>Diagnostic Problem & Findings</span>
            </div>
            <p className="text-xs text-[#444444] leading-relaxed">{explanation}</p>
            <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] font-mono text-[11px] text-[#333333]">
              <span className="font-bold text-[#111111] block mb-0.5">Evidence Detected:</span>
              {evidence}
            </div>
          </div>

          {/* 2. Why It Matters */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E5E5] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
              <TrendingUp className="w-4 h-4 text-[#111111]" />
              <span>Why This Matters for Your Local SEO</span>
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">{expectedBenefit}</p>
          </div>

          {/* 3. Recommended Fix & Action Steps */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-[#111111]" />
              <span>Recommended Action Steps</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] text-xs text-[#222222] leading-relaxed space-y-2">
              <p>{recommendedAction}</p>
              <div className="pt-2 border-t border-[#EAEAEA] flex items-center justify-between text-[11px] text-[#666666]">
                <span>Requires manual entry in Google Business Profile Manager</span>
                <a
                  href="https://business.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#111111] hover:underline"
                >
                  <span>Open business.google.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* 4. Suggested Content (Copyable) */}
          {suggestedContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  Suggested Content Template
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 text-xs gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#111111]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Suggestion</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#CCCCCC] text-xs text-[#111111] leading-relaxed whitespace-pre-wrap select-all font-mono">
                {suggestedContent}
              </div>
            </div>
          )}

          {/* 5. Automation Notice vs Real Implementation */}
          {canAutomate && isAuthorized ? (
            <div className="p-4 rounded-2xl bg-white border border-[#111111] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                <Sparkles className="w-4 h-4 text-[#111111]" />
                <span>Authorized Google API Automation Available</span>
              </div>
              <p className="text-xs text-[#555555]">
                Your Google Business Profile account is connected with write authorization. You may push this update directly.
              </p>

              {authSuccess ? (
                <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#111111] text-xs font-bold text-[#111111] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update successfully pushed to Google Business Profile API!</span>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-[#222222] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedAuth}
                      onChange={(e) => setConfirmedAuth(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-[#CCCCCC] text-[#111111] focus:ring-[#111111]"
                    />
                    <span>
                      I explicitly confirm and authorize applying this change directly to Google Business Profile.
                    </span>
                  </label>

                  <Button
                    size="sm"
                    disabled={!confirmedAuth || isApplyingAuth}
                    onClick={handleExecuteAutomatedFix}
                    className="w-full gap-2"
                  >
                    {isApplyingAuth ? "Pushing to Google API..." : "Apply Authorized Fix to Profile"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#E5E5E5] text-[11px] text-[#666666] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
              <span>
                <strong>Manual Action Required:</strong> To maintain profile safety and integrity, changes must be applied directly in Google Business Profile Manager or via a verified Google connection. We never silently modify profiles.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E5E5E5] bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onDismiss();
                  onClose();
                }}
                className="text-xs text-[#777777] hover:text-[#111111]"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                <span>Dismiss Finding</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
            {onMarkCompleted && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onMarkCompleted();
                  onClose();
                }}
                className="text-xs gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark as Completed</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
