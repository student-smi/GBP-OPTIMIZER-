import { describe, it, expect } from "vitest";
import { runBusinessProfileAudit } from "../lib/audit-engine/runner";
import { BusinessProfileInput } from "../lib/audit-engine/types";

describe("GBP Audit Engine", () => {
  it("computes a perfect 100/100 score for a fully optimized business profile", () => {
    const perfectProfile: BusinessProfileInput = {
      name: "Apex Precision Plumbing & HVAC",
      primaryCategory: "Plumber",
      additionalCategories: ["HVAC Contractor", "Heating Contractor", "Air Conditioning Contractor"],
      address: "100 Main Street, Suite 400",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "US",
      phone: "+1 (512) 555-0199",
      website: "https://apexplumbingaustin.com",
      description:
        "Apex Precision Plumbing & HVAC provides 24/7 commercial and residential plumbing services throughout greater Austin. With over 25 years of master craftsmanship, our licensed technicians specialize in tankless water heater installation, sewer line inspections, and emergency leak repairs. We pride ourselves on transparent pricing and rapid response times.",
      openingHours: {
        monday: "08:00 - 18:00",
        tuesday: "08:00 - 18:00",
        wednesday: "08:00 - 18:00",
        thursday: "08:00 - 18:00",
        friday: "08:00 - 18:00",
        saturday: "09:00 - 15:00",
        sunday: "Closed",
      },
      services: [
        "Tankless Water Heater Installation",
        "Hydro Jetting Drain Cleaning",
        "Sewer Camera Video Inspection",
        "Emergency Slab Leak Repair",
      ],
      products: ["High-Efficiency Water Softener Unit", "Smart Leak Detection System"],
      photosCount: 35,
      exteriorPhotos: 6,
      interiorPhotos: 12,
      teamPhotos: 8,
      reviewCount: 48,
      averageRating: 4.9,
      unansweredReviews: 1, // >97% response rate
    };

    const result = runBusinessProfileAudit(perfectProfile);

    expect(result.overallScore).toBe(100);
    expect(result.allFindings.length).toBe(0);
    expect(result.categories.completeness.score).toBe(30);
    expect(result.categories.accuracy.score).toBe(20);
    expect(result.categories.categories.score).toBe(15);
    expect(result.categories.reviews.score).toBe(15);
    expect(result.categories.photos.score).toBe(10);
    expect(result.categories.website.score).toBe(10);
  });

  it("identifies critical gaps on an empty/sparse business profile and applies appropriate deductions", () => {
    const poorProfile: BusinessProfileInput = {
      name: "",
      primaryCategory: "",
    };

    const result = runBusinessProfileAudit(poorProfile);

    expect(result.overallScore).toBeLessThanOrEqual(45);
    expect(result.allFindings.length).toBeGreaterThan(5);

    // Verify critical findings
    const criticalFindings = result.allFindings.filter((f) => f.severity === "critical");
    expect(criticalFindings.length).toBeGreaterThanOrEqual(2);
    expect(criticalFindings.some((f) => f.id === "comp_missing_name")).toBe(true);
    expect(criticalFindings.some((f) => f.id === "comp_missing_category")).toBe(true);
  });

  it("penalizes keyword stuffing and insecure HTTP in accuracy category", () => {
    const spammyProfile: BusinessProfileInput = {
      name: "Bob's Plumbing - Best Cheap 24/7 Plumber in Dallas Emergency Repair",
      primaryCategory: "Plumber",
      phone: "+1 (214) 555-0199",
      website: "http://bobsplumbing.com", // Insecure HTTP
      address: "123 Elm St",
      city: "Dallas",
      state: "TX",
      postalCode: "75201",
    };

    const result = runBusinessProfileAudit(spammyProfile);

    expect(result.categories.accuracy.score).toBeLessThan(20);
    expect(result.allFindings.some((f) => f.id === "acc_keyword_stuffing")).toBe(true);
    expect(result.allFindings.some((f) => f.id === "acc_insecure_http")).toBe(true);
  });

  it("evaluates review management issues and reply coverage", () => {
    const neglectedProfile: BusinessProfileInput = {
      name: "Downtown Cafe",
      primaryCategory: "Cafe",
      reviewCount: 30,
      averageRating: 3.2, // low rating
      unansweredReviews: 20, // 33% response rate
    };

    const result = runBusinessProfileAudit(neglectedProfile);

    expect(result.categories.reviews.score).toBeLessThan(10);
    expect(result.allFindings.some((f) => f.id === "rev_low_rating")).toBe(true);
    expect(result.allFindings.some((f) => f.id === "rev_low_response_rate")).toBe(true);
  });
});
