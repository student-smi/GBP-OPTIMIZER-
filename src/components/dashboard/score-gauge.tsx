"use client";

import React from "react";
import { getScoreColor } from "@/lib/utils";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showDetails?: boolean;
}

export function ScoreGauge({
  score,
  size = 170,
  strokeWidth = 12,
  showDetails = true,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const scoreTheme = getScoreColor(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EEEEEE"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle: 10% Black */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#111111"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black tracking-tight text-[#111111]">
            {score}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
            out of 100
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 flex flex-col items-center gap-1 text-center">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${scoreTheme.badge}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{scoreTheme.label}</span>
          </div>
          <p className="text-[11px] text-[#666666] max-w-[200px]">
            {score >= 80
              ? "Profile meets recommended completeness baselines."
              : score >= 60
              ? "Optimization gaps detected across several categories."
              : "Critical missing fields require immediate attention."}
          </p>
        </div>
      )}
    </div>
  );
}
