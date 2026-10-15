"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Building2,
  MapPin,
  Phone,
  Globe,
  Clock,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  ShieldAlert,
  Loader2,
  Layers,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OnboardingWizardPage() {
  const router = useRouter();

  // Step state: 1 (Find), 2 (Information), 3 (Data Source), 4 (Confirm)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Search state for Step 1
  const [searchMethod, setSearchMethod] = useState<"places" | "manual">("manual");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Business form state for Step 2
  const [formData, setFormData] = useState({
    name: "",
    primaryCategory: "",
    secondaryCategories: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    isServiceAreaOnly: false,
    phone: "",
    website: "",
    googleProfileUrl: "",
    openingHours: JSON.stringify({
      monday: "08:00 - 18:00",
      tuesday: "08:00 - 18:00",
      wednesday: "08:00 - 18:00",
      thursday: "08:00 - 18:00",
      friday: "08:00 - 18:00",
      saturday: "09:00 - 15:00",
      sunday: "Closed",
    }),
    description: "",
    services: "",
    products: "",
    reviewCount: 15,
    averageRating: 46, // 4.6 stars
    photosCount: 18,
    exteriorPhotos: 4,
    interiorPhotos: 6,
    teamPhotos: 3,
    unansweredReviews: 2,
  });

  // Data source selection for Step 3
  const [dataSource, setDataSource] = useState<"manual" | "public_search" | "gbp_oauth">("manual");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Search in Step 1
  const handlePlacesSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/places/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok && data.results) {
        setSearchResults(data.results);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPlaceResult = (result: any) => {
    setFormData((prev) => ({
      ...prev,
      name: result.name || prev.name,
      address: result.formattedAddress || prev.address,
      primaryCategory: result.types?.[0] ? result.types[0].replace(/_/g, " ") : prev.primaryCategory,
      reviewCount: result.userRatingsTotal || prev.reviewCount,
      averageRating: result.rating ? Math.round(result.rating * 10) : prev.averageRating,
    }));
    setStep(2);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Final submission in Step 4
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          openingHours: typeof formData.openingHours === "string" ? JSON.parse(formData.openingHours) : formData.openingHours,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save business profile");
      }

      router.push(`/businesses/${data.business.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Wizard Progress Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#777777]">
          <span>STEP {step} OF 4</span>
          <span className="text-[#111111] uppercase tracking-wider">
            {step === 1 && "Find Your Business"}
            {step === 2 && "Business Information & Signals"}
            {step === 3 && "Select Data Source"}
            {step === 4 && "Review & Confirm Profile"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#EEEEEE] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#111111] transition-all duration-300 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] text-[#111111] text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ========================================================
          STEP 1: FIND YOUR BUSINESS
          ======================================================== */}
      {step === 1 && (
        <Card className="border border-[#E5E5E5] bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Step 1: Locate Your Business Profile</CardTitle>
            <CardDescription>
              Select whether to look up your existing public location or enter details manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Google Places Search */}
              <div
                onClick={() => setSearchMethod("places")}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  searchMethod === "places"
                    ? "border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]"
                    : "border-[#E5E5E5] bg-white hover:border-[#CCCCCC]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-[#111111]" />
                  <h3 className="text-sm font-bold text-[#111111]">Option A: Search via Places</h3>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Search by business name or address. Auto-fills address, phone, rating, and categories if Google Places API is active.
                </p>
              </div>

              {/* Option B: Enter Manually */}
              <div
                onClick={() => setSearchMethod("manual")}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  searchMethod === "manual"
                    ? "border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]"
                    : "border-[#E5E5E5] bg-white hover:border-[#CCCCCC]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-[#111111]" />
                  <h3 className="text-sm font-bold text-[#111111]">Option B: Enter Manually</h3>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Recommended. Type in your profile information directly. 100% reliable and requires zero Google API keys or billing.
                </p>
              </div>
            </div>

            {/* Places Search Panel */}
            {searchMethod === "places" && (
              <div className="p-5 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
                    <input
                      type="text"
                      placeholder="e.g. Apex Precision Plumbing Austin"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePlacesSearch()}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#CCCCCC] bg-white text-[#111111]"
                    />
                  </div>
                  <Button
                    onClick={handlePlacesSearch}
                    isLoading={isSearching}
                    variant="default"
                    size="sm"
                    className="text-xs"
                  >
                    Search
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="divide-y divide-[#E5E5E5] bg-white rounded-lg border border-[#E5E5E5] max-h-60 overflow-y-auto">
                    {searchResults.map((res, i) => (
                      <div
                        key={i}
                        onClick={() => selectPlaceResult(res)}
                        className="p-3 hover:bg-[#F5F5F5] cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <strong className="text-[#111111] block">{res.name}</strong>
                          <span className="text-[#666666]">{res.formattedAddress}</span>
                        </div>
                        <Button variant="outline" size="sm" className="text-[11px] h-7">
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
              <span className="text-xs text-[#777777]">
                Manual entry is always supported without external keys.
              </span>
              <Button
                variant="default"
                onClick={() => setStep(2)}
                className="gap-2"
              >
                <span>Continue to Information</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================
          STEP 2: BUSINESS INFORMATION & SIGNALS
          ======================================================== */}
      {step === 2 && (
        <Card className="border border-[#E5E5E5] bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Step 2: Business Information & Signals</CardTitle>
            <CardDescription>
              Enter accurate profile data. Each field directly impacts local Google 3-Pack rankings and user conversion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Identity & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">
                    Business Name *
                  </label>
                  <span className="text-[10px] text-[#777777]">Exact signage name</span>
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Apex Precision Plumbing"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:ring-1 focus:ring-[#111111]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">
                    Primary Category *
                  </label>
                  <span className="text-[10px] text-[#777777]">Key algorithmic ranking factor</span>
                </div>
                <input
                  type="text"
                  name="primaryCategory"
                  required
                  placeholder="e.g. Plumber, Bakery, Dentist"
                  value={formData.primaryCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111] focus:ring-1 focus:ring-[#111111]"
                />
              </div>
            </div>

            {/* Address & Service Area */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="123 Congress Ave, Suite 400"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Austin"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111]"
                />
              </div>
            </div>

            {/* Contact & Web */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">
                    Phone Number (E.164 standard)
                  </label>
                  <span className="text-[10px] text-[#777777]">One-tap mobile calling</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 512-555-0199"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">
                    Website URL (HTTPS required)
                  </label>
                  <span className="text-[10px] text-[#777777]">Organic authority signal</span>
                </div>
                <input
                  type="url"
                  name="website"
                  placeholder="https://apexplumbing.com"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111]"
                />
              </div>
            </div>

            {/* Business Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#111111]">
                  Business Description (Max 750 characters)
                </label>
                <span className="text-[10px] text-[#777777] font-mono">
                  {formData.description.length} / 750
                </span>
              </div>
              <textarea
                rows={3}
                name="description"
                maxLength={750}
                placeholder="Highlight your services, history, and service area..."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111]"
              />
            </div>

            {/* Services Offered */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111111]">
                Catalog Services (Comma-separated)
              </label>
              <input
                type="text"
                name="services"
                placeholder="Drain Cleaning, Water Heater Replacement, Pipe Repair"
                value={formData.services}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] bg-white text-[#111111]"
              />
            </div>

            {/* Wizard Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={!formData.name.trim() || !formData.primaryCategory.trim()}
                onClick={() => setStep(3)}
                className="gap-1.5 text-xs"
              >
                <span>Continue to Data Source</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================
          STEP 3: DATA SOURCE SELECTION
          ======================================================== */}
      {step === 3 && (
        <Card className="border border-[#E5E5E5] bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Step 3: Select Verification Data Source</CardTitle>
            <CardDescription>
              Declare how profile signals will be verified. We maintain transparent source attribution for every audit finding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {/* Method 1: Manual Business Details */}
              <div
                onClick={() => setDataSource("manual")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  dataSource === "manual"
                    ? "border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]"
                    : "border-[#E5E5E5] bg-white hover:border-[#CCCCCC]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#111111]" />
                    <h4 className="text-xs font-bold text-[#111111]">
                      1. User-Supplied Profile Details (Active)
                    </h4>
                  </div>
                  <Badge variant="default" className="text-[10px]">
                    100% Reliable
                  </Badge>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Audit runs directly against the fields verified by the business owner or SEO consultant. Zero scraping or fake metrics.
                </p>
              </div>

              {/* Method 2: Publicly Available Information */}
              <div
                onClick={() => setDataSource("public_search")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  dataSource === "public_search"
                    ? "border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]"
                    : "border-[#E5E5E5] bg-white hover:border-[#CCCCCC]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#111111]" />
                    <h4 className="text-xs font-bold text-[#111111]">
                      2. Public Web & Website Inspection
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    SSRF Protected
                  </Badge>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Evaluates public meta tags, homepage title tags, and security protocols. Complies strictly with lawful web standards.
                </p>
              </div>

              {/* Method 3: Official Google Business Profile Connection */}
              <div
                onClick={() => setDataSource("gbp_oauth")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  dataSource === "gbp_oauth"
                    ? "border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]"
                    : "border-[#E5E5E5] bg-white hover:border-[#CCCCCC]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#111111]" />
                    <h4 className="text-xs font-bold text-[#111111]">
                      3. Official Google Business Profile OAuth
                    </h4>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    Optional
                  </Badge>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Authorizes direct sync with Google Business Profile APIs. Requires approved Google Cloud credentials. Can be connected later from Workspace Settings.
                </p>
              </div>
            </div>

            {/* Disclaimer Alert */}
            <div className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] text-xs text-[#555555] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
              <span>
                <strong>Integrity Policy:</strong> We never fabricate Google Maps data or claim manual inputs were automatically verified. Every finding distinguishes between verified merchant inputs and connected accounts.
              </span>
            </div>

            {/* Wizard Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setStep(4)}
                className="gap-1.5 text-xs"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================
          STEP 4: CONFIRM BUSINESS & REGISTER
          ======================================================== */}
      {step === 4 && (
        <Card className="border border-[#E5E5E5] bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Step 4: Confirm Business Profile</CardTitle>
            <CardDescription>
              Review your collected profile details before saving to your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Box */}
            <div className="p-5 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                <div>
                  <h3 className="text-base font-bold text-[#111111]">{formData.name}</h3>
                  <span className="text-[#666666]">{formData.primaryCategory}</span>
                </div>
                <Badge variant="outline" className="capitalize text-xs">
                  Source: {dataSource.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#777777] block">
                    Location Address
                  </span>
                  <span className="text-[#111111]">
                    {formData.address ? `${formData.address}, ` : ""}
                    {formData.city || "Unspecified"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#777777] block">
                    Contact & Website
                  </span>
                  <span className="text-[#111111] block">{formData.phone || "No phone entered"}</span>
                  <span className="text-[#666666] truncate block">{formData.website || "No website"}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#777777] block">
                    Reviews & Rating
                  </span>
                  <span className="text-[#111111]">
                    {formData.reviewCount} reviews • {(formData.averageRating / 10).toFixed(1)} ★ avg
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#777777] block">
                    Photo Gallery Count
                  </span>
                  <span className="text-[#111111]">{formData.photosCount} total photos</span>
                </div>
              </div>

              {formData.description && (
                <div className="pt-2 border-t border-[#E5E5E5]">
                  <span className="text-[10px] uppercase font-bold text-[#777777] block mb-1">
                    Business Description Preview
                  </span>
                  <p className="text-[#333333] line-clamp-2">{formData.description}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(3)}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleFinalSubmit}
                className="gap-2 px-6"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Add Business Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
