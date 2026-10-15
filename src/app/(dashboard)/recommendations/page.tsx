"use client";

import React, { useState, useEffect } from "react";
import { TaskItem, TaskItemProps } from "@/components/recommendations/task-item";
import {
  CheckSquare,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RecommendationsPage() {
  const [tasks, setTasks] = useState<TaskItemProps[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    dismissed: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      let url = "/api/recommendations?";
      if (statusFilter !== "all") url += `status=${statusFilter}&`;
      if (severityFilter !== "all") url += `severity=${severityFilter}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.recommendations || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [statusFilter, severityFilter]);

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
    );
    // Refresh counts
    fetchRecommendations();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Prioritized Optimization Checklist
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Actionable tasks prioritized by ranking and conversion impact. Track execution status across all locations.
          </p>
        </div>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === "all"
              ? "bg-[#111111] text-white shadow-none"
              : "bg-[#F5F5F5] text-[#666666] hover:text-[#111111] hover:bg-[#EAEAEA]"
          }`}
        >
          All Tasks ({counts.total})
        </button>

        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === "pending"
              ? "bg-[#111111] text-white shadow-none"
              : "bg-[#F5F5F5] text-[#666666] hover:text-[#111111] hover:bg-[#EAEAEA]"
          }`}
        >
          Pending ({counts.pending})
        </button>

        <button
          onClick={() => setStatusFilter("in_progress")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === "in_progress"
              ? "bg-[#111111] text-white shadow-none"
              : "bg-[#F5F5F5] text-[#666666] hover:text-[#111111] hover:bg-[#EAEAEA]"
          }`}
        >
          In Progress ({counts.inProgress})
        </button>

        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === "completed"
              ? "bg-[#111111] text-white shadow-none"
              : "bg-[#F5F5F5] text-[#666666] hover:text-[#111111] hover:bg-[#EAEAEA]"
          }`}
        >
          Completed ({counts.completed})
        </button>

        <button
          onClick={() => setStatusFilter("dismissed")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === "dismissed"
              ? "bg-[#111111] text-white shadow-none"
              : "bg-[#F5F5F5] text-[#666666] hover:text-[#111111] hover:bg-[#EAEAEA]"
          }`}
        >
          Dismissed ({counts.dismissed})
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading optimization checklist...</p>
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-foreground">
              No tasks match current filter
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Change status filter or run a new audit on any business profile to generate fresh recommendations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {/* Bottom Ranking Notice */}
      <div className="p-4 rounded-xl border border-border/50 bg-muted/20 flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p>
          Executing optimization recommendations improves profile completeness, accuracy, and conversion readiness. Search rankings depend on multiple external factors including geographical proximity, localized relevance, and algorithm updates.
        </p>
      </div>
    </div>
  );
}
