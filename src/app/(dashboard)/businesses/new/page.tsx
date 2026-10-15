"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Clock,
  Sparkles,
  Camera,
  Star,
  FileText,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NewBusinessPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    primaryCategory: "",
    additionalCategories: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    isServiceAreaBusiness: false,
    phone: "",
    website: "",
    description: "",
    openingHoursMonday: "08:00 - 18:00",
    openingHoursSaturday: "09:00 - 15:00",
    openingHoursSunday: "Closed",
    services: "",
    products: "",
    photosCount: 15,
    exteriorPhotos: 3,
    interiorPhotos: 5,
    teamPhotos: 2,
    reviewCount: 18,
    averageRating: 4.8,
    unansweredReviews: 2,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        primaryCategory: formData.primaryCategory,
        additionalCategories: formData.additionalCategories
          ? formData.additionalCategories.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        isServiceAreaBusiness: formData.isServiceAreaBusiness,
        phone: formData.phone,
        website: formData.website,
        description: formData.description,
        openingHours: {
          mon_fri: formData.openingHoursMonday,
          saturday: formData.openingHoursSaturday,
          sunday: formData.openingHoursSunday,
        },
        services: formData.services
          ? formData.services.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        products: formData.products
          ? formData.products.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        photosCount: Number(formData.photosCount) || 0,
        exteriorPhotos: Number(formData.exteriorPhotos) || 0,
        interiorPhotos: Number(formData.interiorPhotos) || 0,
        teamPhotos: Number(formData.teamPhotos) || 0,
        reviewCount: Number(formData.reviewCount) || 0,
        averageRating: Number(formData.averageRating) || 0,
        unansweredReviews: Number(formData.unansweredReviews) || 0,
      };

      // 1. Create Business Record
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create business profile");
      }

      const { businessId } = await res.json();

      // 2. Automatically Run Initial Audit
      const auditRes = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, dataSource: "manual" }),
      });

      if (auditRes.ok) {
        const auditData = await auditRes.json();
        router.push(`/audits/${auditData.auditId}`);
      } else {
        router.push(`/businesses/${businessId}`);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/businesses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Businesses</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Enter Google Business Profile Information
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter publicly visible profile details to run an automated, deterministic audit and receive prioritized recommendations.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] text-[#111111] text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core Identity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#111111]" />
              <CardTitle>Core Identity & Category</CardTitle>
            </div>
            <CardDescription>
              Basic business credentials matching real-world signage and registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Official Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Apex Precision Plumbing"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Primary Category *
                </label>
                <input
                  type="text"
                  name="primaryCategory"
                  required
                  placeholder="e.g. Plumber, Italian Restaurant, Dentist"
                  value={formData.primaryCategory}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Secondary Categories (Comma-separated)
              </label>
              <input
                type="text"
                name="additionalCategories"
                placeholder="e.g. HVAC Contractor, Heating Contractor, Drainage Service"
                value={formData.additionalCategories}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-[11px] text-muted-foreground block">
                Google allows up to 9 secondary categories to capture related search queries.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Contact & Location */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <CardTitle>Physical Address & Contact</CardTitle>
            </div>
            <CardDescription>
              Local NAP (Name, Address, Phone) consistency indicators.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                id="isServiceAreaBusiness"
                name="isServiceAreaBusiness"
                checked={formData.isServiceAreaBusiness}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="isServiceAreaBusiness" className="text-xs font-medium text-foreground cursor-pointer">
                This is a Service-Area Business (travels to customers, hides physical address on Maps)
              </label>
            </div>

            {!formData.isServiceAreaBusiness && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="123 Main Street, Suite 400"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-semibold text-foreground">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Austin"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="TX"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="78701"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Primary Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+1 (512) 555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Website URL
                </label>
                <input
                  type="text"
                  name="website"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Profile Description & Offerings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#111111]" />
              <CardTitle>Description & Offerings</CardTitle>
            </div>
            <CardDescription>
              Detailed narrative and catalog items. Maximum 750 characters for description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Business Description
                </label>
                <span className={`text-[11px] font-mono ${formData.description.length > 750 ? "text-rose-500 font-bold" : "text-muted-foreground"}`}>
                  {formData.description.length} / 750
                </span>
              </div>
              <textarea
                name="description"
                rows={4}
                maxLength={750}
                placeholder="Describe your business background, specialties, and service standards..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Services Offered (Comma-separated)
                </label>
                <input
                  type="text"
                  name="services"
                  placeholder="Water Heater Installation, Leak Repair, Drain Cleaning"
                  value={formData.services}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Featured Products (Comma-separated)
                </label>
                <input
                  type="text"
                  name="products"
                  placeholder="Tankless Water Heater, Softener System"
                  value={formData.products}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Visuals & Reviews Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#111111]" />
              <CardTitle>Photos & Reviews Inventory</CardTitle>
            </div>
            <CardDescription>
              Inventory counts from Google Business Profile manager.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Total Photos</label>
                <input
                  type="number"
                  name="photosCount"
                  min="0"
                  value={formData.photosCount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Exterior Photos</label>
                <input
                  type="number"
                  name="exteriorPhotos"
                  min="0"
                  value={formData.exteriorPhotos}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Interior Photos</label>
                <input
                  type="number"
                  name="interiorPhotos"
                  min="0"
                  value={formData.interiorPhotos}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Team Photos</label>
                <input
                  type="number"
                  name="teamPhotos"
                  min="0"
                  value={formData.teamPhotos}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Total Reviews Count</label>
                <input
                  type="number"
                  name="reviewCount"
                  min="0"
                  value={formData.reviewCount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Average Star Rating (0 - 5.0)</label>
                <input
                  type="number"
                  name="averageRating"
                  step="0.1"
                  min="0"
                  max="5.0"
                  value={formData.averageRating}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Unanswered Reviews</label>
                <input
                  type="number"
                  name="unansweredReviews"
                  min="0"
                  value={formData.unansweredReviews}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/businesses">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="default" type="submit" isLoading={isSubmitting} className="gap-2 px-6">
            <Sparkles className="w-4 h-4" />
            <span>Save & Run Automated Audit</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
