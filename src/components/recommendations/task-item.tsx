"use client";

import React, { useState } from "react";
import { getSeverityBadge } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  XCircle,
  Check,
  Eye,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ViewFixModal } from "../audit/view-fix-modal";

export interface TaskItemProps {
  id: string;
  title: string;
  description: string;
  actionSteps: string;
  expectedBenefit: string;
  effort: "low" | "medium" | "high";
  severity: "critical" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "dismissed";
  canAutomate: boolean;
  businessName?: string;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

export function TaskItem({
  task,
  onStatusChange,
}: {
  task: TaskItemProps;
  onStatusChange?: (id: string, status: string) => void;
}) {
  const [currentStatus, setCurrentStatus] = useState(task.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const badgeInfo = getSeverityBadge(task.severity);

  const handleUpdate = async (newStatus: "pending" | "in_progress" | "completed" | "dismissed") => {
    setIsUpdating(true);
    setCurrentStatus(newStatus);
    try {
      const res = await fetch(`/api/recommendations/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok && onStatusChange) {
        onStatusChange(task.id, newStatus);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getSuggestedContent = (): string => {
    const t = (task.title + " " + task.description).toLowerCase();
    if (t.includes("description")) {
      return `Welcome to our business! We are proud to provide certified, reliable, and top-tier services to our local community. With years of experience and dedicated professionals, we ensure 100% satisfaction on every project. Call us today or visit our website for a free consultation!`;
    }
    if (t.includes("review") || t.includes("reply")) {
      return `Thank you so much for your kind review and for choosing us! We are thrilled that you had a wonderful experience. Please do not hesitate to reach out if you need anything in the future!`;
    }
    if (t.includes("service") || t.includes("category")) {
      return `1. Primary Emergency Diagnostic & Repair\n2. Standard Consultation & Maintenance Inspection\n3. Residential & Commercial Service Packages\n4. Guaranteed Workmanship Warranty`;
    }
    return `Recommended Action:\n${task.actionSteps}`;
  };

  return (
    <>
      <div
        className={`rounded-2xl border p-4 transition-all bg-white ${
          currentStatus === "completed"
            ? "border-[#E5E5E5] bg-[#FAFAFA] opacity-75"
            : currentStatus === "dismissed"
            ? "border-[#E5E5E5] bg-[#F7F7F7] opacity-60"
            : "border-[#E5E5E5] hover:border-[#CCCCCC]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeInfo.className}`}
              >
                {badgeInfo.label}
              </span>

              {task.businessName && (
                <Badge variant="outline" className="text-[10px]">
                  {task.businessName}
                </Badge>
              )}

              <Badge
                variant={currentStatus === "completed" ? "default" : "secondary"}
                className="text-[10px] capitalize"
              >
                {currentStatus.replace("_", " ")}
              </Badge>

              {task.canAutomate && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#111111] bg-[#F5F5F5] border border-[#E5E5E5] px-2 py-0.5 rounded">
                  <Sparkles className="w-3 h-3" />
                  <span>API Automation</span>
                </span>
              )}
            </div>

            <h3
              className={`text-sm font-bold text-[#111111] ${
                currentStatus === "completed" ? "line-through text-[#777777]" : ""
              }`}
            >
              {task.title}
            </h3>

            <p className="text-xs text-[#666666] leading-relaxed">
              {task.description}
            </p>

            <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] text-xs space-y-1">
              <div className="font-bold text-[#111111] flex items-center gap-1.5 text-[11px]">
                <ArrowRight className="w-3.5 h-3.5 text-[#111111]" />
                <span>Recommended Implementation:</span>
              </div>
              <p className="text-[#444444] text-[11px]">{task.actionSteps}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#666666]">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#111111]" />
                <span>
                  <strong className="text-[#111111]">Impact:</strong> {task.expectedBenefit}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#111111]" />
                <span>
                  <strong className="text-[#111111]">Effort:</strong>{" "}
                  <span className="capitalize">{task.effort}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Status & View Fix Actions */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
            {/* View Fix Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8 text-xs gap-1.5 font-semibold"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Fix</span>
            </Button>

            {currentStatus !== "completed" && (
              <button
                onClick={() => handleUpdate("completed")}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#111111] text-white hover:bg-black transition-all active:scale-95 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Done</span>
              </button>
            )}

            {currentStatus !== "in_progress" && currentStatus !== "completed" && (
              <button
                onClick={() => handleUpdate("in_progress")}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] text-[#111111] transition-all disabled:opacity-50"
              >
                <Clock className="w-3 h-3 text-[#555555]" />
                <span>In Progress</span>
              </button>
            )}

            {currentStatus === "completed" && (
              <button
                onClick={() => handleUpdate("pending")}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] text-[#111111] transition-all disabled:opacity-50"
              >
                <span>Reopen</span>
              </button>
            )}

            {currentStatus !== "dismissed" && (
              <button
                onClick={() => handleUpdate("dismissed")}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-[#777777] hover:text-[#111111] transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3 h-3" />
                <span>Dismiss</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ViewFixModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        findingTitle={task.title}
        categoryKey="profile_optimization"
        severity={task.severity}
        explanation={task.description}
        evidence={`Recorded in optimization plan for task ${task.id}`}
        recommendedAction={task.actionSteps}
        expectedBenefit={task.expectedBenefit}
        suggestedContent={getSuggestedContent()}
        canAutomate={task.canAutomate}
        onMarkCompleted={() => handleUpdate("completed")}
        onDismiss={() => handleUpdate("dismissed")}
      />
    </>
  );
}
