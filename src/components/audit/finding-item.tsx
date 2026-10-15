"use client";

import React, { useState } from "react";
import { getSeverityBadge } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  Check,
  XCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewFixModal } from "./view-fix-modal";

export interface FindingProps {
  id: string;
  categoryKey: string;
  title: string;
  description: string;
  evidence: string;
  severity: "critical" | "high" | "medium" | "low";
  deduction: number;
  recommendation?: {
    title: string;
    problemDescription: string;
    suggestedAction: string;
    expectedBenefit: string;
    effort: "low" | "medium" | "high";
    manualConfirmationRequired: boolean;
    canAutomateThroughIntegration: boolean;
    suggestedContent?: string;
  };
}

export function FindingItem({
  finding,
  isAuthorized = false,
  onStatusChange,
}: {
  finding: FindingProps;
  isAuthorized?: boolean;
  onStatusChange?: (id: string, status: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const badgeInfo = getSeverityBadge(finding.severity);

  // Generate copyable suggestion template based on finding context
  const getSuggestedContent = (): string => {
    if (finding.recommendation?.suggestedContent) {
      return finding.recommendation.suggestedContent;
    }
    const t = (finding.title + " " + finding.description).toLowerCase();
    if (t.includes("description")) {
      return `Welcome to our business! We are proud to provide certified, reliable, and top-tier services to our local community. With years of experience and dedicated professionals, we ensure 100% satisfaction on every project. Call us today or visit our website for a free consultation!`;
    }
    if (t.includes("review") || t.includes("rating")) {
      return `Thank you so much for your kind review and for choosing us! We are thrilled that you had a wonderful experience. Please do not hesitate to reach out if you need anything in the future!`;
    }
    if (t.includes("service") || t.includes("category")) {
      return `1. Primary Emergency Diagnostic & Repair\n2. Standard Consultation & Maintenance Inspection\n3. Residential & Commercial Service Packages\n4. Guaranteed Workmanship Warranty`;
    }
    if (t.includes("photo") || t.includes("image")) {
      return `Photo Upload Checklist:\n• High-resolution exterior facade with street signage visible\n• Reception / interior customer service area\n• Team in branded uniforms at work\n• Before-and-after project photos`;
    }
    return `Recommended Action:\n${finding.recommendation?.suggestedAction || finding.description}`;
  };

  const handleMarkCompleted = () => {
    setIsCompleted(true);
    if (onStatusChange) onStatusChange(finding.id, "completed");
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onStatusChange) onStatusChange(finding.id, "dismissed");
  };

  if (isDismissed) {
    return (
      <div className="p-3 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] text-xs text-[#888888] flex items-center justify-between">
        <span className="line-through">{finding.title} (Dismissed)</span>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-xs text-[#111111] font-semibold hover:underline"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`rounded-2xl border transition-all bg-white overflow-hidden ${
          isCompleted
            ? "border-[#E5E5E5] bg-[#F9F9F9] opacity-80"
            : "border-[#E5E5E5] hover:border-[#CCCCCC]"
        }`}
      >
        {/* Clickable Header */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
          >
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${badgeInfo.className}`}
            >
              {badgeInfo.label}
            </span>
            <div className="truncate">
              <h4
                className={`text-xs font-bold text-[#111111] truncate ${
                  isCompleted ? "line-through text-[#666666]" : ""
                }`}
              >
                {finding.title}
              </h4>
              <p className="text-[11px] text-[#666666] truncate">{finding.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-xs font-bold text-[#111111] bg-[#F5F5F5] border border-[#E5E5E5] px-2 py-0.5 rounded">
              -{finding.deduction} pts
            </span>

            {/* View Fix Primary Action */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-7 text-xs px-2.5 gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Fix</span>
            </Button>

            {/* Toggle Accordion */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-[#777777] hover:text-[#111111] rounded"
              aria-label="Toggle details"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Details Body */}
        {isOpen && (
          <div className="p-4 pt-0 border-t border-[#F0F0F0] space-y-3 bg-[#FAFAFA]">
            {/* Evidence Snippet */}
            <div className="mt-3 p-3 rounded-xl bg-white border border-[#E5E5E5] text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#111111] mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#111111]" />
                <span>Evidence Collected</span>
              </div>
              <p className="font-mono text-[#444444] text-[11px]">{finding.evidence}</p>
            </div>

            {/* Actionable Recommendation */}
            {finding.recommendation && (
              <div className="p-3.5 rounded-xl border border-[#E0E0E0] bg-white space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#111111] text-xs">
                  <Lightbulb className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Recommended Action</span>
                </div>
                <p className="text-xs font-medium text-[#222222]">
                  {finding.recommendation.suggestedAction}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#F0F0F0] text-[11px]">
                  <div className="flex items-center gap-1 text-[#666666]">
                    <TrendingUp className="w-3 h-3 text-[#111111]" />
                    <span>
                      <strong className="text-[#111111]">Expected Benefit:</strong>{" "}
                      {finding.recommendation.expectedBenefit}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#666666]">
                    <Clock className="w-3 h-3 text-[#111111]" />
                    <span>
                      <strong className="text-[#111111]">Effort:</strong>{" "}
                      <span className="capitalize">{finding.recommendation.effort}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="h-7 text-xs gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Open Full Fix Guide</span>
                </Button>
                {!isCompleted ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkCompleted}
                    className="h-7 text-xs text-[#111111] hover:bg-[#EAEAEA] gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark Completed</span>
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-[#111111] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Completed</span>
                  </span>
                )}
              </div>

              <button
                onClick={handleDismiss}
                className="text-[11px] text-[#777777] hover:text-[#111111] flex items-center gap-1"
              >
                <XCircle className="w-3 h-3" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Fix Interactive Modal */}
      <ViewFixModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        findingTitle={finding.title}
        categoryKey={finding.categoryKey}
        severity={finding.severity}
        explanation={finding.description}
        evidence={finding.evidence}
        recommendedAction={
          finding.recommendation?.suggestedAction ||
          "Open your Google Business Profile dashboard and update this field to adhere to local search guidelines."
        }
        expectedBenefit={
          finding.recommendation?.expectedBenefit ||
          "Improves local keyword relevancy, map pack positioning, and customer conversion rates."
        }
        suggestedContent={getSuggestedContent()}
        canAutomate={Boolean(finding.recommendation?.canAutomateThroughIntegration)}
        isAuthorized={isAuthorized}
        onMarkCompleted={handleMarkCompleted}
        onDismiss={handleDismiss}
      />
    </>
  );
}
