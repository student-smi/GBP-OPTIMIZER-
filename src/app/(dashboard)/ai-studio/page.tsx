"use client";

import React, { useState } from "react";
import {
  Sparkles,
  FileText,
  MessageSquare,
  Megaphone,
  Briefcase,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type StudioTab = "description" | "review_reply" | "post" | "service";

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>("description");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Common Business State
  const [businessName, setBusinessName] = useState("Apex Precision Plumbing & HVAC");
  const [category, setCategory] = useState("Plumber");
  const [city, setCity] = useState("Austin, TX");

  // Description Tab State
  const [descServices, setDescServices] = useState("Tankless Water Heaters, Drain Cleaning, Emergency Leak Repair");

  // Review Reply State
  const [reviewerName, setReviewerName] = useState("Sarah Jenkins");
  const [starRating, setStarRating] = useState(5);
  const [reviewText, setReviewText] = useState(
    "Apex Plumbing arrived within 45 minutes of our emergency call on a Sunday. Mike replaced our burst water heater valve quickly and cleanly. Truly saved the day!"
  );

  // Post State
  const [postType, setPostType] = useState<"offer" | "update" | "event">("offer");
  const [postTopic, setPostTopic] = useState("Spring AC & Plumbing Tune-Up Special");

  // Service Description State
  const [serviceName, setServiceName] = useState("Tankless Water Heater Installation");

  // Output State
  const [generatedResult, setGeneratedResult] = useState<{
    content: string;
    headline?: string;
    callToAction?: string;
    modelUsed?: string;
    isFallback?: boolean;
  } | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCopied(false);

    try {
      let payload: any = {
        type: activeTab,
        businessName,
        category,
        city,
      };

      if (activeTab === "description") {
        payload.services = descServices.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (activeTab === "review_reply") {
        payload.reviewerName = reviewerName;
        payload.starRating = starRating;
        payload.reviewText = reviewText;
      } else if (activeTab === "post") {
        payload.postType = postType;
        payload.topic = postTopic;
      } else if (activeTab === "service") {
        payload.serviceName = serviceName;
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedResult(data);
      }
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    const textToCopy = generatedResult.headline
      ? `${generatedResult.headline}\n\n${generatedResult.content}\n\nCTA: ${generatedResult.callToAction || "Contact Us"}`
      : generatedResult.content;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5] text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Content Studio</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            GBP Content & Review Reply Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate guideline-compliant business descriptions, customer review responses, local Google posts, and service catalog items.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => {
            setActiveTab("description");
            setGeneratedResult(null);
          }}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "description"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Description</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("review_reply");
            setGeneratedResult(null);
          }}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "review_reply"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Review Reply</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("post");
            setGeneratedResult(null);
          }}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "post"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Google Post</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("service");
            setGeneratedResult(null);
          }}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "service"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Service Catalog</span>
        </button>
      </div>

      {/* Main Studio Grid: Form on Left, Generated Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Pane (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base">Business Context</CardTitle>
              <CardDescription>
                Parameters used to anchor content to verified business realities.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Dynamic Form Fields per Tab */}
              {activeTab === "description" && (
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <label className="text-xs font-semibold text-foreground">
                    Featured Services (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={descServices}
                    onChange={(e) => setDescServices(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[11px] text-muted-foreground block">
                    Target length: 500–700 characters conforming to Google GBP rules.
                  </span>
                </div>
              )}

              {activeTab === "review_reply" && (
                <div className="space-y-2.5 pt-2 border-t border-border/40">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Reviewer Name</label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Star Rating</label>
                      <select
                        value={starRating}
                        onChange={(e) => setStarRating(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value={5}>5 Stars (Delighted)</option>
                        <option value={4}>4 Stars (Positive)</option>
                        <option value={3}>3 Stars (Neutral / Mixed)</option>
                        <option value={2}>2 Stars (Dissatisfied)</option>
                        <option value={1}>1 Star (Critical Complaint)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Customer Review Text</label>
                    <textarea
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === "post" && (
                <div className="space-y-2.5 pt-2 border-t border-border/40">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Post Type</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["offer", "update", "event"] as const).map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setPostType(t)}
                          className={`py-1.5 rounded-lg text-xs font-semibold capitalize border ${
                            postType === t
                              ? "border-[#111111] bg-[#111111] text-white font-bold"
                              : "border-[#E5E5E5] bg-white text-[#666666] hover:text-[#111111]"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Campaign Topic / Headline Focus</label>
                    <input
                      type="text"
                      value={postTopic}
                      onChange={(e) => setPostTopic(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === "service" && (
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <label className="text-xs font-semibold text-foreground">Service Item Name</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g. Tankless Water Heater Installation"
                    className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[11px] text-muted-foreground block">
                    Generates a concise 80-120 word description for Google catalog listings.
                  </span>
                </div>
              )}

              <div className="pt-3">
                <Button
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  variant="default"
                  className="w-full gap-2 shadow-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Content</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Preview Pane (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/60">
              <div>
                <CardTitle className="text-base">Generated Content Preview</CardTitle>
                <CardDescription>
                  Review and edit before publishing to your Google Business Profile.
                </CardDescription>
              </div>

              {generatedResult && (
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#111111]" />
                      <span className="text-[#111111] font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-6 flex-1 flex flex-col justify-center">
              {isGenerating ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-foreground">
                    Generating optimized content...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Applying Google Business Profile content guidelines & tone standards.
                  </p>
                </div>
              ) : generatedResult ? (
                <div className="space-y-4">
                  {/* Headline if Post */}
                  {generatedResult.headline && (
                    <div className="p-3 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] text-[#111111] font-bold text-base">
                      {generatedResult.headline}
                    </div>
                  )}

                  {/* Main Body */}
                  <div className="relative">
                    <textarea
                      rows={8}
                      value={generatedResult.content}
                      onChange={(e) =>
                        setGeneratedResult({ ...generatedResult, content: e.target.value })
                      }
                      className="w-full p-4 rounded-xl border border-border bg-muted/20 text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>Length: {generatedResult.content.length} characters</span>
                      <span className="text-[11px] text-muted-foreground italic">Editable textarea</span>
                    </div>
                  </div>

                  {/* Call to action badge */}
                  {generatedResult.callToAction && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
                      <span className="font-semibold text-foreground">Recommended CTA Button:</span>
                      <Badge variant="outline">{generatedResult.callToAction}</Badge>
                    </div>
                  )}

                  {/* Engine Badge */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <span>Engine:</span>
                      <strong className="text-foreground">{generatedResult.modelUsed}</strong>
                    </span>

                    {generatedResult.isFallback && (
                      <span className="text-[11px] text-[#666666] font-medium">
                        Deterministic fallback active
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3 text-muted-foreground">
                  <Sparkles className="w-10 h-10 mx-auto opacity-40 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">
                    Ready to Generate
                  </h4>
                  <p className="text-xs max-w-sm mx-auto">
                    Fill in your business details on the left and click &ldquo;Generate Content&rdquo; to create publication-ready copy.
                  </p>
                </div>
              )}
            </CardContent>

            <div className="p-4 border-t border-border/50 bg-muted/20 text-[11px] text-muted-foreground flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#111111] shrink-0" />
              <span>Always verify factual accuracy (hours, contact, licensing) before publishing to live profiles.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
