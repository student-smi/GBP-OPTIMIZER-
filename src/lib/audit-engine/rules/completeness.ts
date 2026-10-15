import { AuditFinding, BusinessProfileInput } from "../types";

export function evaluateCompleteness(profile: BusinessProfileInput): {
  score: number;
  maxScore: number;
  findings: AuditFinding[];
  evaluatedCount: number;
  passedCount: number;
} {
  const maxScore = 30;
  let deductions = 0;
  const findings: AuditFinding[] = [];
  let evaluatedCount = 0;
  let passedCount = 0;

  // 1. Business Name (5 pts)
  evaluatedCount++;
  if (!profile.name || profile.name.trim().length === 0) {
    deductions += 5;
    findings.push({
      id: "comp_missing_name",
      categoryKey: "completeness",
      ruleId: "name_presence",
      title: "Business Name Is Missing",
      description: "A valid business name is mandatory for Google Business Profile discovery.",
      evidence: "Business name field is blank.",
      severity: "critical",
      deduction: 5,
      recommendation: {
        title: "Specify Official Registered Business Name",
        problemDescription: "Google cannot verify or index a profile without an exact business name.",
        suggestedAction: "Enter the official trading name as shown on your business storefront and legal documents.",
        expectedBenefit: "Ensures profile verification and discovery in Google Maps searches.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 2. Primary Category (5 pts)
  evaluatedCount++;
  if (!profile.primaryCategory || profile.primaryCategory.trim().length === 0) {
    deductions += 5;
    findings.push({
      id: "comp_missing_category",
      categoryKey: "completeness",
      ruleId: "primary_category_presence",
      title: "Primary Category Is Missing",
      description: "Primary category is the single strongest foundational ranking signal on GBP.",
      evidence: "No primary category selected.",
      severity: "critical",
      deduction: 5,
      recommendation: {
        title: "Choose the Most Specific Primary Category",
        problemDescription: "Without a primary category, Google cannot classify your core service offerings.",
        suggestedAction: "Select the most precise category from Google's approved taxonomy matching your primary revenue service.",
        expectedBenefit: "Directly determines which local map pack queries your profile qualifies for.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 3. Address or Service Area (4 pts)
  evaluatedCount++;
  const hasPhysicalAddress = Boolean(profile.address && profile.address.trim().length > 3);
  if (!hasPhysicalAddress && !profile.isServiceAreaBusiness) {
    deductions += 4;
    findings.push({
      id: "comp_missing_address",
      categoryKey: "completeness",
      ruleId: "address_presence",
      title: "Physical Address or Service Area Missing",
      description: "Local search engines require either a verified physical location or declared service areas.",
      evidence: "No address entered and service-area business flag is not enabled.",
      severity: "high",
      deduction: 4,
      recommendation: {
        title: "Enter Storefront Address or Define Service Areas",
        problemDescription: "Customers cannot navigate to your business and Google cannot pinpoint local proximity.",
        suggestedAction: "Add your full street address or configure service area radius if you travel to clients.",
        expectedBenefit: "Enables appearance in Google Maps 'near me' local pack queries.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 4. Phone Number (4 pts)
  evaluatedCount++;
  if (!profile.phone || profile.phone.trim().length === 0) {
    deductions += 4;
    findings.push({
      id: "comp_missing_phone",
      categoryKey: "completeness",
      ruleId: "phone_presence",
      title: "Phone Number Missing",
      description: "Direct phone contact is essential for mobile click-to-call conversion.",
      evidence: "Phone number field is empty.",
      severity: "high",
      deduction: 4,
      recommendation: {
        title: "Add Primary Local Phone Number",
        problemDescription: "Mobile users on Google Maps cannot call your business directly.",
        suggestedAction: "Add a local area-code phone number answered during regular business hours.",
        expectedBenefit: "Improves mobile call lead conversion and validates local geographic presence.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 5. Website URL (3 pts)
  evaluatedCount++;
  if (!profile.website || profile.website.trim().length === 0) {
    deductions += 3;
    findings.push({
      id: "comp_missing_website",
      categoryKey: "completeness",
      ruleId: "website_presence",
      title: "Website Link Missing",
      description: "A linked website reinforces organic relevance and provides deep context to Google algorithms.",
      evidence: "No website URL provided.",
      severity: "medium",
      deduction: 3,
      recommendation: {
        title: "Link Official Business Landing Page",
        problemDescription: "Lack of website limits consumer trust and prevents organic backlink value from passing to GBP.",
        suggestedAction: "Add your secure HTTPS homepage or location-specific landing page URL.",
        expectedBenefit: "Drives organic website traffic and improves authority verification.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 6. Regular Hours (3 pts)
  evaluatedCount++;
  const hasHours = Boolean(
    profile.openingHours &&
      (typeof profile.openingHours === "string"
        ? profile.openingHours.trim().length > 5
        : Object.keys(profile.openingHours).length > 0)
  );
  if (!hasHours) {
    deductions += 3;
    findings.push({
      id: "comp_missing_hours",
      categoryKey: "completeness",
      ruleId: "opening_hours_presence",
      title: "Business Operating Hours Not Set",
      description: "Profiles without set hours display 'Hours not known' warnings on Google Maps.",
      evidence: "No weekly schedule configured.",
      severity: "high",
      deduction: 3,
      recommendation: {
        title: "Configure Weekly Operating Hours",
        problemDescription: "Customers may turn away assuming your business is closed or unmanaged.",
        suggestedAction: "Specify open and close times for every day of the week, including holiday hours.",
        expectedBenefit: "Shows green 'Open Now' badge during operating periods, boosting walk-in traffic.",
        effort: "medium",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 7. Business Description (3 pts)
  evaluatedCount++;
  const descLength = profile.description?.trim().length || 0;
  if (descLength === 0) {
    deductions += 3;
    findings.push({
      id: "comp_missing_description",
      categoryKey: "completeness",
      ruleId: "description_presence",
      title: "Business Description Is Blank",
      description: "GBP allows up to 750 characters to introduce your business story and specialties.",
      evidence: "Description field has 0 characters.",
      severity: "medium",
      deduction: 3,
      recommendation: {
        title: "Draft an Engaging 500+ Character Description",
        problemDescription: "Missing profile summary reduces consumer engagement and keyword relevancy.",
        suggestedAction: "Use our AI Studio to generate a factual, compelling narrative outlining your background, awards, and unique offerings.",
        expectedBenefit: "Enhances semantic relevance and consumer conversion rate.",
        effort: "medium",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else if (descLength < 250) {
    deductions += 1;
    findings.push({
      id: "comp_short_description",
      categoryKey: "completeness",
      ruleId: "description_length",
      title: "Business Description Is Too Brief",
      description: `Current description is only ${descLength} characters. Optimal length is between 400 and 750 characters.`,
      evidence: `Description is ${descLength} characters long.`,
      severity: "low",
      deduction: 1,
      recommendation: {
        title: "Expand Business Description to Cover Key Services",
        problemDescription: "Short descriptions fail to communicate unique value propositions and history.",
        suggestedAction: "Expand the text to describe what differentiates your business, payment methods, and local service coverage.",
        expectedBenefit: "Improves dwell time on your profile and semantic matching.",
        effort: "low",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 8. Services Catalog (2 pts)
  evaluatedCount++;
  const servicesCount = Array.isArray(profile.services) ? profile.services.length : 0;
  if (servicesCount === 0) {
    deductions += 2;
    findings.push({
      id: "comp_missing_services",
      categoryKey: "completeness",
      ruleId: "services_presence",
      title: "No Itemized Services Added",
      description: "Listing explicit services enables GBP justifications ('Provides: ...') in mobile search.",
      evidence: "Zero services listed in the profile catalog.",
      severity: "medium",
      deduction: 2,
      recommendation: {
        title: "Populate Itemized Services Catalog",
        problemDescription: "Potential clients cannot see your full range of offerings directly on Maps.",
        suggestedAction: "Add at least 5-10 specific services with pricing and brief descriptions.",
        expectedBenefit: "Triggers bolded search justifications on Google when users search for specific service terms.",
        effort: "medium",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  // 9. Products Catalog (1 pt)
  evaluatedCount++;
  const productsCount = Array.isArray(profile.products) ? profile.products.length : 0;
  if (productsCount === 0) {
    deductions += 1;
    findings.push({
      id: "comp_missing_products",
      categoryKey: "completeness",
      ruleId: "products_presence",
      title: "Product Showcase Not Utilized",
      description: "Showcasing featured products creates an interactive visual carousel on your mobile profile.",
      evidence: "No products configured.",
      severity: "low",
      deduction: 1,
      recommendation: {
        title: "Add Featured Products or Packages",
        problemDescription: "Misses out on visual carousel real estate in mobile search results.",
        suggestedAction: "Add 3 to 5 featured products or service packages with images and prices.",
        expectedBenefit: "Drives direct customer interest and visual engagement.",
        effort: "medium",
        manualConfirmationRequired: true,
        canAutomateThroughIntegration: true,
      },
    });
  } else {
    passedCount++;
  }

  const finalScore = Math.max(0, maxScore - deductions);
  return {
    score: finalScore,
    maxScore,
    findings,
    evaluatedCount,
    passedCount,
  };
}
