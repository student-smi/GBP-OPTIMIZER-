"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    async function loadBusiness() {
      if (!businessId) return;
      try {
        const res = await fetch(`/api/businesses/${businessId}`);
        if (!res.ok) {
          throw new Error("Failed to load business profile");
        }
        const data = await res.json();
        const biz = data.business;
        setFormData({
          name: biz.name || "",
          primaryCategory: biz.primaryCategory || "",
          additionalCategories: Array.isArray(biz.additionalCategories)
            ? biz.additionalCategories.join(", ")
            : "",
          address: biz.address || "",
          city: biz.city || "",
          state: biz.state || "",
          postalCode: biz.postalCode || "",
          country: biz.country || "US",
          isServiceAreaBusiness: Boolean(biz.isServiceAreaBusiness),
          phone: biz.phone || "",
          website: biz.website || "",
          description: biz.description || "",
          openingHoursMonday: biz.openingHours?.mon_fri || "08:00 - 18:00",
          openingHoursSaturday: biz.openingHours?.saturday || "09:00 - 15:00",
          openingHoursSunday: biz.openingHours?.sunday || "Closed",
          services: Array.isArray(biz.services) ? biz.services.join(", ") : "",
          products: Array.isArray(biz.products) ? biz.products.join(", ") : "",
          photosCount: biz.photosCount || 0,
          exteriorPhotos: biz.exteriorPhotos || 0,
          interiorPhotos: biz.interiorPhotos || 0,
          teamPhotos: biz.teamPhotos || 0,
          reviewCount: biz.reviewCount || 0,
          averageRating: biz.averageRating || 0,
          unansweredReviews: biz.unansweredReviews || 0,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load business details");
      } finally {
        setIsLoading(false);
      }
    }
    loadBusiness();
  }, [businessId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

      const res = await fetch(`/api/businesses/${businessId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update business profile");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/businesses/${businessId}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#111111]" />
        <p className="text-sm text-muted-foreground">Loading business profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={`/businesses/${businessId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Business Overview</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Edit Business Information
        </h1>
        <p className="text-sm text-muted-foreground">
          Update the profile information used for GBP audits and recommendations.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] text-[#111111] text-sm font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#111111] text-[#111111] text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Business profile successfully updated! Redirecting...</span>
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

        {/* Section 2: NAP & Service Area */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#111111]" />
              <CardTitle>Name, Address & Phone (NAP)</CardTitle>
            </div>
            <CardDescription>
              Address and contact consistency is one of the highest weighted local ranking signals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
              <input
                type="checkbox"
                id="isServiceAreaBusiness"
                name="isServiceAreaBusiness"
                checked={formData.isServiceAreaBusiness}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
              />
              <label
                htmlFor="isServiceAreaBusiness"
                className="text-xs font-medium text-foreground cursor-pointer"
              >
                This is a Service-Area Business (SAB) — hide street address on Google Maps
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Street Address {formData.isServiceAreaBusiness ? "(Optional / Hidden)" : "*"}
                </label>
                <input
                  type="text"
                  name="address"
                  required={!formData.isServiceAreaBusiness}
                  placeholder="e.g. 742 Evergreen Terrace"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Chicago"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">State / Region</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="e.g. IL"
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
                    placeholder="e.g. 60601"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. +1 (312) 555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Website URL</label>
                <input
                  type="url"
                  name="website"
                  placeholder="e.g. https://apexplumbing.com"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Description & Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#111111]" />
              <CardTitle>Business Description & Hours</CardTitle>
            </div>
            <CardDescription>
              Complete narrative description (max 750 characters) and standard opening hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Business Description
                </label>
                <span
                  className={`text-[11px] font-semibold ${
                    formData.description.length > 750
                      ? "text-red-500"
                      : formData.description.length >= 250
                      ? "text-[#111111]"
                      : "text-muted-foreground"
                  }`}
                >
                  {formData.description.length} / 750 characters
                </span>
              </div>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Monday - Friday</label>
                <input
                  type="text"
                  name="openingHoursMonday"
                  value={formData.openingHoursMonday}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Saturday</label>
                <input
                  type="text"
                  name="openingHoursSaturday"
                  value={formData.openingHoursSaturday}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Sunday</label>
                <input
                  type="text"
                  name="openingHoursSunday"
                  value={formData.openingHoursSunday}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Services & Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#111111]" />
              <CardTitle>Catalog of Services & Products</CardTitle>
            </div>
            <CardDescription>
              Explicit service lists trigger Google search highlight badges for specific customer needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Itemized Services (Comma-separated)
              </label>
              <textarea
                name="services"
                rows={2}
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
                value={formData.products}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/businesses/${businessId}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Business Information</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
