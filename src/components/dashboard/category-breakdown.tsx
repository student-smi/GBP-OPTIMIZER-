"use client";

import React from "react";
import {
  FileText,
  CheckCircle2,
  Tags,
  Star,
  Image as ImageIcon,
  Globe,
} from "lucide-react";

interface CategoryScoreItem {
  categoryKey: string;
  categoryName: string;
  score: number;
  maxScore: number;
  findingsCount: number;
}

interface CategoryBreakdownProps {
  categories: CategoryScoreItem[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  completeness: <FileText className="w-3.5 h-3.5 text-[#111111]" />,
  accuracy: <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />,
  categories: <Tags className="w-3.5 h-3.5 text-[#111111]" />,
  reviews: <Star className="w-3.5 h-3.5 text-[#111111]" />,
  photos: <ImageIcon className="w-3.5 h-3.5 text-[#111111]" />,
  website: <Globe className="w-3.5 h-3.5 text-[#111111]" />,
};

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const percentage = Math.round((cat.score / cat.maxScore) * 100);

        return (
          <div
            key={cat.categoryKey}
            className="p-3 rounded-lg border border-[#E5E5E5] bg-white hover:border-[#CCCCCC] transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-[#F5F5F5] border border-[#EAEAEA]">
                  {CATEGORY_ICONS[cat.categoryKey] || <FileText className="w-3.5 h-3.5 text-[#111111]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111111]">
                    {cat.categoryName}
                  </h4>
                  <span className="text-[10px] text-[#777777]">
                    Weight: {cat.maxScore} pts ({percentage}%)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-[#111111]">
                  {cat.score}
                </span>
                <span className="text-[10px] text-[#777777]"> / {cat.maxScore}</span>
                {cat.findingsCount > 0 && (
                  <div className="text-[10px] text-[#555555] font-semibold">
                    {cat.findingsCount} issue{cat.findingsCount > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>

            {/* Minimalist Progress Track: 10% Black fill */}
            <div className="w-full h-1.5 bg-[#EEEEEE] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#111111] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
