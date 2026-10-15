import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number | string | Date): string {
  const d = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(timestamp: number | string | Date): string {
  const d = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * 90% White / 10% Black Scoring System
 */
export function getScoreColor(score: number): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  label: string;
} {
  if (score >= 80) {
    return {
      bg: "bg-white",
      text: "text-[#111111]",
      border: "border-[#111111]",
      badge: "bg-[#111111] text-white border border-[#111111]",
      label: "Excellent Profile Health",
    };
  }
  if (score >= 60) {
    return {
      bg: "bg-[#F7F7F7]",
      text: "text-[#111111]",
      border: "border-[#CCCCCC]",
      badge: "bg-[#F0F0F0] text-[#111111] border border-[#CCCCCC]",
      label: "Needs Optimization",
    };
  }
  return {
    bg: "bg-[#FAFAFA]",
    text: "text-[#111111]",
    border: "border-[#D5D5D5]",
    badge: "bg-[#EAEAEA] text-[#111111] border border-[#CCCCCC]",
    label: "Critical Gaps Detected",
  };
}

/**
 * 90% White / 10% Black Severity System
 */
export function getSeverityBadge(severity: "critical" | "high" | "medium" | "low"): {
  className: string;
  label: string;
} {
  switch (severity) {
    case "critical":
      return {
        className: "bg-[#111111] text-white border border-[#111111]",
        label: "Critical",
      };
    case "high":
      return {
        className: "bg-[#444444] text-white border border-[#333333]",
        label: "High Priority",
      };
    case "medium":
      return {
        className: "bg-[#F0F0F0] text-[#111111] border border-[#CCCCCC]",
        label: "Medium Priority",
      };
    case "low":
      return {
        className: "bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5]",
        label: "Low Priority",
      };
  }
}
