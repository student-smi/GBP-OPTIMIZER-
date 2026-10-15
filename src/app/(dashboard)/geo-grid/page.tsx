"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Loader2,
  TrendingUp,
  Award,
  ShieldCheck,
  Building2,
  Printer,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ChevronRight,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BusinessOption {
  id: string;
  name: string;
  primaryCategory: string;
  city: string;
  state: string;
  services: string[];
}

interface GeoPin {
  id: string;
  row: number;
  col: number;
  latOffsetKm: number;
  lngOffsetKm: number;
  rank: number;
  distanceKm: number;
  competitors: {
    rank: number;
    name: string;
    rating: number;
    reviewsCount: number;
    isUserBusiness: boolean;
  }[];
}

interface GeoScan {
  id: string;
  businessId: string;
  keyword: string;
  gridSize: string;
  radiusKm: number;
  averageRank: number;
  top3Percentage: number;
  shareOfLocalVoice: number;
  pinsData: GeoPin[];
  createdAt: number;
}

export default function GeoGridPage() {
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedBizId, setSelectedBizId] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [gridSize, setGridSize] = useState<"3x3" | "5x5">("3x3");
  const [radiusKm, setRadiusKm] = useState<number>(5);

  const [isLoadingBiz, setIsLoadingBiz] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [currentScan, setCurrentScan] = useState<GeoScan | null>(null);
  const [selectedPin, setSelectedPin] = useState<GeoPin | null>(null);
  const [pastScans, setPastScans] = useState<GeoScan[]>([]);

  // Fetch businesses
  useEffect(() => {
    async function loadBusinesses() {
      try {
        const res = await fetch("/api/businesses");
        if (res.ok) {
          const data = await res.json();
          const list = data.businesses || [];
          setBusinesses(list);
          if (list.length > 0) {
            setSelectedBizId(list[0].id);
            // Default keyword from category
            setKeyword(`${list[0].primaryCategory} near me`);
          }
        }
      } catch (err) {
        console.error("Failed to load businesses", err);
      } finally {
        setIsLoadingBiz(false);
      }
    }
    loadBusinesses();
  }, []);

  // Fetch scans for selected business
  useEffect(() => {
    if (!selectedBizId) return;
    async function loadScans() {
      try {
        const res = await fetch(`/api/geo-grid?businessId=${selectedBizId}`);
        if (res.ok) {
          const data = await res.json();
          const list = data.scans || [];
          setPastScans(list);
          if (list.length > 0) {
            setCurrentScan(list[0]);
            setSelectedPin(list[0].pinsData[Math.floor(list[0].pinsData.length / 2)] || null);
          } else {
            setCurrentScan(null);
            setSelectedPin(null);
          }
        }
      } catch (err) {
        console.error("Failed to load scans", err);
      }
    }
    loadScans();
  }, [selectedBizId]);

  const activeBusiness = businesses.find((b) => b.id === selectedBizId);

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId || !keyword) return;

    setIsScanning(true);
    try {
      const res = await fetch("/api/geo-grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: selectedBizId,
          keyword,
          gridSize,
          radiusKm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const scan = data.scan;
        setCurrentScan(scan);
        setPastScans((prev) => [scan, ...prev]);
        setSelectedPin(scan.pinsData[Math.floor(scan.pinsData.length / 2)] || null);
      } else {
        alert("Failed to run geo-grid scan");
      }
    } catch (err) {
      alert("Error executing scan");
    } finally {
      setIsScanning(false);
    }
  };

  const presetKeywords = activeBusiness
    ? [
        `${activeBusiness.primaryCategory} near me`,
        `best ${activeBusiness.primaryCategory} in ${activeBusiness.city || "city"}`,
        `emergency ${activeBusiness.primaryCategory}`,
        ...(activeBusiness.services && activeBusiness.services.length > 0
          ? [activeBusiness.services[0]]
          : []),
      ]
    : [];

  const getPinStyle = (rank: number) => {
    if (rank === 1) {
      return "bg-[#111111] text-white ring-2 ring-[#111111] ring-offset-2";
    }
    if (rank <= 3) {
      return "bg-[#222222] text-white";
    }
    if (rank <= 6) {
      return "bg-[#555555] text-white";
    }
    if (rank <= 10) {
      return "bg-[#EAEAEA] text-[#111111] border border-[#CCCCCC]";
    }
    return "bg-[#F7F7F7] text-[#777777] border border-[#E5E5E5]";
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] text-xs font-semibold mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#111111]" />
            <span>Local 3-Pack Geographic Visibility Radar</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#111111] tracking-tight">
            Local Geo-Grid Rank Tracker
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Track exact Google Maps ranking positions across multi-kilometer GPS coordinates around your storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentScan && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Geo Report</span>
            </Button>
          )}
        </div>
      </div>

      {/* Control Panel Card */}
      <Card className="border-[#E5E5E5] bg-white shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleRunScan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Business Select */}
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-[#111111]">Target Business</label>
                <select
                  value={selectedBizId}
                  onChange={(e) => setSelectedBizId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E5E5] bg-white text-xs text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111]"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city || "Storefront"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Keyword Input */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#111111]">
                  Target Search Keyword / Query
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. plumber near me, emergency root canal"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E5E5E5] bg-white text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#777777]" />
                </div>
              </div>

              {/* Grid Settings & Action */}
              <div className="grid grid-cols-2 gap-2 md:col-span-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111111]">Grid Size</label>
                  <select
                    value={gridSize}
                    onChange={(e) => setGridSize(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#E5E5E5] bg-white text-xs font-semibold text-[#111111]"
                  >
                    <option value="3x3">3x3 (9 Pins)</option>
                    <option value="5x5">5x5 (25 Pins)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111111]">Radius</label>
                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#E5E5E5] bg-white text-xs font-semibold text-[#111111]"
                  >
                    <option value={1}>1 km (Hyperlocal)</option>
                    <option value={3}>3 km</option>
                    <option value={5}>5 km (Standard)</option>
                    <option value={10}>10 km (Metro)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Keyword Preset Pills */}
            {presetKeywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#777777]">Suggested:</span>
                {presetKeywords.map((kw, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setKeyword(kw)}
                    className="px-2.5 py-0.5 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-medium text-[#111111] hover:bg-[#EAEAEA] transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            )}

            {/* Scan Action */}
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isScanning || !selectedBizId || !keyword}
                className="gap-2 font-semibold text-xs px-5 shadow-sm"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Scanning Coordinates...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Scan Local Geo-Grid</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Scan Results View */}
      {currentScan && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center justify-between text-[#777777] text-xs font-semibold">
                <span>Average Grid Rank (AGR)</span>
                <TrendingUp className="w-4 h-4 text-[#111111]" />
              </div>
              <div className="text-3xl font-black text-[#111111] mt-2 flex items-baseline gap-1">
                <span>#{currentScan.averageRank.toFixed(1)}</span>
                <span className="text-xs text-[#777777] font-semibold">avg across pins</span>
              </div>
              <p className="text-[11px] text-[#666666] mt-1">
                Position #1–#3 places your business in the prominent Google Maps 3-pack.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center justify-between text-[#777777] text-xs font-semibold">
                <span>Top 3-Pack Dominance</span>
                <Award className="w-4 h-4 text-[#111111]" />
              </div>
              <div className="text-3xl font-black text-[#111111] mt-2">
                {currentScan.top3Percentage}%
              </div>
              <p className="text-[11px] text-[#666666] mt-1">
                Percentage of surveyed geographic pins where your business captures the top 3 pack.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center justify-between text-[#777777] text-xs font-semibold">
                <span>Share of Local Voice (SoLV)</span>
                <ShieldCheck className="w-4 h-4 text-[#111111]" />
              </div>
              <div className="text-3xl font-black text-[#111111] mt-2">
                {currentScan.shareOfLocalVoice}%
              </div>
              <p className="text-[11px] text-[#666666] mt-1">
                Relative customer impression share throughout the {currentScan.radiusKm} km search radius.
              </p>
            </div>
          </div>

          {/* Interactive Map & Competitor Inspector Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: The Visual Geo-Grid Map Canvas */}
            <Card className="lg:col-span-7 border-[#E5E5E5] bg-white overflow-hidden shadow-sm">
              <CardHeader className="p-5 border-b border-[#F0F0F0]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>Geographic Grid Radar</span>
                      <Badge variant="outline" className="text-[10px]">
                        {currentScan.gridSize} • {currentScan.radiusKm} km
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Query: <strong className="text-[#111111]">&quot;{currentScan.keyword}&quot;</strong> • Click any pin to inspect competitors.
                    </CardDescription>
                  </div>

                  <span className="text-[11px] font-mono text-[#777777]">
                    Center: {activeBusiness?.name}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-8 flex flex-col items-center justify-center bg-[#FAFAFA] min-h-[420px]">
                {/* Visual Map Grid Canvas */}
                <div className="relative p-6 rounded-3xl bg-white border border-[#E5E5E5] shadow-sm">
                  {/* Concentric Radar Rings */}
                  <div className="absolute inset-4 rounded-full border border-dashed border-[#E5E5E5] pointer-events-none" />
                  <div className="absolute inset-12 rounded-full border border-dashed border-[#EAEAEA] pointer-events-none" />

                  {/* Grid Container */}
                  <div
                    className={`grid gap-4 sm:gap-6 relative z-10 ${
                      currentScan.gridSize === "5x5" ? "grid-cols-5" : "grid-cols-3"
                    }`}
                  >
                    {currentScan.pinsData.map((pin) => {
                      const isSelected = selectedPin?.id === pin.id;
                      const isCenter =
                        pin.row === Math.floor(Math.sqrt(currentScan.pinsData.length) / 2) &&
                        pin.col === Math.floor(Math.sqrt(currentScan.pinsData.length) / 2);

                      return (
                        <button
                          key={pin.id}
                          type="button"
                          onClick={() => setSelectedPin(pin)}
                          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center transition-all select-none shadow-sm cursor-pointer ${getPinStyle(
                            pin.rank
                          )} ${
                            isSelected
                              ? "scale-110 shadow-lg ring-4 ring-[#111111]/20 font-black"
                              : "hover:scale-105"
                          }`}
                        >
                          <span className="text-sm sm:text-base font-black leading-none">
                            #{pin.rank}
                          </span>
                          <span className="text-[9px] opacity-80 mt-0.5 font-medium leading-none">
                            {pin.distanceKm === 0 ? "HQ" : `${pin.distanceKm}k`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-[#666666]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#111111]" />
                    <span>#1 Top Leader</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#222222]" />
                    <span>#2–#3 3-Pack</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#555555]" />
                    <span>#4–#6 Mid Pack</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#EAEAEA] border border-[#CCCCCC]" />
                    <span>#7+ Low Visibility</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right 5 Cols: Selected Pin SERP Inspector */}
            <Card className="lg:col-span-5 border-[#E5E5E5] bg-white shadow-sm">
              <CardHeader className="p-5 border-b border-[#F0F0F0]">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#111111]" />
                      <span>Coordinate SERP Inspector</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Who ranks at this exact GPS point?
                    </CardDescription>
                  </div>

                  {selectedPin && (
                    <Badge variant="default" className="text-xs">
                      Rank #{selectedPin.rank}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {selectedPin ? (
                  <>
                    <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#111111]">
                        <span>Offset Distance:</span>
                        <span>
                          {selectedPin.distanceKm === 0
                            ? "Exact Storefront Location"
                            : `${selectedPin.distanceKm} km from center`}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#777777] flex items-center justify-between">
                        <span>Relative Coordinate:</span>
                        <span className="font-mono">
                          {selectedPin.latOffsetKm} km N, {selectedPin.lngOffsetKm} km E
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                        Top Local Ranking Competitors
                      </span>

                      <div className="space-y-2">
                        {selectedPin.competitors.map((comp, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                              comp.isUserBusiness
                                ? "bg-[#F7F7F7] border-[#111111] shadow-sm"
                                : "bg-white border-[#E5E5E5]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  comp.isUserBusiness
                                    ? "bg-[#111111] text-white"
                                    : "bg-[#F0F0F0] text-[#111111]"
                                }`}
                              >
                                #{comp.rank}
                              </span>

                              <div className="min-w-0">
                                <span
                                  className={`font-bold block truncate ${
                                    comp.isUserBusiness ? "text-[#111111]" : "text-[#333333]"
                                  }`}
                                >
                                  {comp.name} {comp.isUserBusiness && "(Your Business)"}
                                </span>
                                <span className="text-[11px] text-[#777777] block">
                                  {comp.rating.toFixed(1)} ★ • {comp.reviewsCount} reviews
                                </span>
                              </div>
                            </div>

                            {comp.isUserBusiness && (
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                You
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Optimization Recommendation Advice */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#E5E5E5] space-y-1 text-xs">
                      <div className="font-bold text-[#111111] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
                        <span>How to expand rank radius here:</span>
                      </div>
                      <p className="text-[11px] text-[#666666] leading-relaxed">
                        {selectedPin.rank > 3
                          ? "Your rank drops outside immediate proximity. Adding secondary service areas, getting reviews from customers in this zip code, and publishing local keyword posts will expand your top 3 reach."
                          : "Strong geographic dominance! Maintain this position by actively replying to fresh reviews and keeping weekly Google post cadence."}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-xs text-[#777777]">
                    Select any pin on the map to inspect local competitors.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scan History Comparison */}
          {pastScans.length > 1 && (
            <Card className="border-[#E5E5E5] bg-white shadow-sm">
              <CardHeader className="p-5 border-b border-[#F0F0F0]">
                <CardTitle className="text-base">Historical Radar Scans</CardTitle>
                <CardDescription className="text-xs">
                  Track how your local 3-pack coverage expands over time as recommendations are executed.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[#F0F0F0]">
                  {pastScans.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setCurrentScan(s);
                        setSelectedPin(s.pinsData[Math.floor(s.pinsData.length / 2)] || null);
                      }}
                      className={`p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAFAFA] transition-colors ${
                        currentScan.id === s.id ? "bg-[#F7F7F7]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex flex-col items-center justify-center font-bold text-xs shrink-0">
                          <span>#{s.averageRank.toFixed(1)}</span>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-[#111111] block">
                            &quot;{s.keyword}&quot; ({s.gridSize} • {s.radiusKm} km)
                          </span>
                          <span className="text-[11px] text-[#777777]">
                            {new Date(s.createdAt).toLocaleDateString()} • Top 3 Dominance:{" "}
                            <strong>{s.top3Percentage}%</strong> • SoLV:{" "}
                            <strong>{s.shareOfLocalVoice}%</strong>
                          </span>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" className="text-xs gap-1">
                        <span>View Grid</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
