import { AuditFinding, BusinessProfileInput } from "../types";

export function evaluateAccuracy(profile: BusinessProfileInput): {
  score: number;
  maxScore: number;
  findings: AuditFinding[];
  evaluatedCount: number;
  passedCount: number;
} {
  const maxScore = 20;
  let deductions = 0;
  const findings: AuditFinding[] = [];
  let evaluatedCount = 0;
  let passedCount = 0;

  // 1. Phone number format validation (5 pts)
  evaluatedCount++;
  if (profile.phone) {
    const raw = profile.phone.trim();
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15 || /[a-zA-Z]/.test(raw)) {
      deductions += 5;
      findings.push({
        id: "acc_invalid_phone",
        categoryKey: "accuracy",
        ruleId: "phone_format",
        title: "Irregular Phone Number Format",
        description: "Phone numbers must adhere to standard regional or international E.164 dial patterns.",
        evidence: `Provided phone string: "${profile.phone}" contains invalid character structure or insufficient digits.`,
        severity: "high",
        deduction: 5,
        recommendation: {
          title: "Standardize Phone Number Formatting",
          problemDescription: "Malformatted phone numbers fail telecom validation and break smartphone one-tap calling.",
          suggestedAction: "Format your number clearly with standard country and area codes (e.g. +1 (555) 123-4567).",
          expectedBenefit: "Prevents failed customer calls and aligns with NAP citation consistency standards.",
          effort: "low",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    } else {
      passedCount++;
    }
  } else {
    // If phone is missing, it was already penalized under completeness; avoid double deduction
    passedCount++;
  }

  // 2. Website HTTPS Protocol Security (5 pts)
  evaluatedCount++;
  if (profile.website) {
    const trimmedUrl = profile.website.trim().toLowerCase();
    if (trimmedUrl.startsWith("http://")) {
      deductions += 5;
      findings.push({
        id: "acc_insecure_http",
        categoryKey: "accuracy",
        ruleId: "website_ssl",
        title: "Website URL Uses Insecure HTTP",
        description: "Google flags non-HTTPS sites as insecure, generating browser security warnings for visitors.",
        evidence: `Provided URL begins with unencrypted "http://": ${profile.website}`,
        severity: "high",
        deduction: 5,
        recommendation: {
          title: "Update Website Link to HTTPS Protocol",
          problemDescription: "Insecure links trigger browser security interstitials that deter prospective customers.",
          suggestedAction: "Ensure your SSL/TLS certificate is active and update your profile URL to start with https://.",
          expectedBenefit: "Preserves user trust and adheres to Google Chrome and Maps security baselines.",
          effort: "low",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    } else if (trimmedUrl.startsWith("https://")) {
      passedCount++;
    } else {
      deductions += 2;
      findings.push({
        id: "acc_missing_protocol",
        categoryKey: "accuracy",
        ruleId: "website_protocol",
        title: "Website URL Missing Protocol Prefix",
        description: "Profile URLs should explicitly specify the https:// scheme.",
        evidence: `URL lacks scheme: ${profile.website}`,
        severity: "medium",
        deduction: 2,
        recommendation: {
          title: "Prepend https:// to Website Address",
          problemDescription: "Ambiguous URLs can cause inconsistent routing across diverse mobile devices.",
          suggestedAction: "Update the field to include the full https:// domain URL.",
          expectedBenefit: "Eliminates redirect latency and ensures reliable link resolution.",
          effort: "low",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    }
  } else {
    passedCount++;
  }

  // 3. Description Spam & Formatting Audit (4 pts)
  evaluatedCount++;
  if (profile.description) {
    const desc = profile.description.trim();
    const upperCount = (desc.match(/[A-Z]/g) || []).length;
    const letterCount = (desc.match(/[a-zA-Z]/g) || []).length;
    const uppercaseRatio = letterCount > 0 ? upperCount / letterCount : 0;

    // Check for excessive ALL CAPS
    if (uppercaseRatio > 0.45 && letterCount > 30) {
      deductions += 4;
      findings.push({
        id: "acc_excessive_caps",
        categoryKey: "accuracy",
        ruleId: "description_caps",
        title: "Excessive Uppercase Text in Description",
        description: "Google's guidelines strictly prohibit writing business descriptions in ALL CAPS.",
        evidence: `${Math.round(uppercaseRatio * 100)}% of letters in the description are uppercase.`,
        severity: "high",
        deduction: 4,
        recommendation: {
          title: "Reformat Description in Standard Sentence Case",
          problemDescription: "Descriptions with excessive capitalization violate Google guidelines and may trigger profile suspensions.",
          suggestedAction: "Rewrite the description in clean, natural sentence case.",
          expectedBenefit: "Ensures compliance with Google Business Profile content guidelines.",
          effort: "low",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    }
    // Check for prohibited URLs or phone numbers stuffed in description
    else if (/https?:\/\/|www\./i.test(desc)) {
      deductions += 2;
      findings.push({
        id: "acc_url_in_description",
        categoryKey: "accuracy",
        ruleId: "description_embedded_links",
        title: "Hyperlinks Detected Inside Business Description",
        description: "Google guidelines forbid inserting raw URLs into the description body.",
        evidence: "Hyperlink patterns detected inside the description text.",
        severity: "medium",
        deduction: 2,
        recommendation: {
          title: "Remove Web Links from Description Body",
          problemDescription: "Links in descriptions are not clickable on Maps and violate Google's quality guidelines.",
          suggestedAction: "Remove website URLs from the narrative and utilize the dedicated Website button.",
          expectedBenefit: "Prevents automated guideline violation flags from Google.",
          effort: "low",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    } else {
      passedCount++;
    }
  } else {
    passedCount++;
  }

  // 4. Address Completeness & Postal Code (3 pts)
  evaluatedCount++;
  if (profile.address && !profile.isServiceAreaBusiness) {
    const hasCity = Boolean(profile.city && profile.city.trim().length > 1);
    const hasPostal = Boolean(profile.postalCode && profile.postalCode.trim().length >= 3);
    if (!hasCity || !hasPostal) {
      deductions += 3;
      findings.push({
        id: "acc_incomplete_address_fields",
        categoryKey: "accuracy",
        ruleId: "address_granularity",
        title: "Missing City or Postal Code in Address",
        description: "Geocoding precision requires exact street, city, state, and postal code attributes.",
        evidence: `City: "${profile.city || "missing"}", Postal Code: "${profile.postalCode || "missing"}".`,
        severity: "medium",
        deduction: 3,
        recommendation: {
          title: "Provide Complete Address Components",
          problemDescription: "Incomplete locality components prevent Google's pin from placing accurately on Maps.",
          suggestedAction: "Explicitly fill out street address, city, state/province, and valid postal zip code.",
          expectedBenefit: "Ensures accurate map geocoding and reliable turn-by-turn driving directions.",
          effort: "low",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    } else {
      passedCount++;
    }
  } else {
    passedCount++;
  }

  // 5. Business Name Keyword Stuffing Check (3 pts)
  evaluatedCount++;
  if (profile.name) {
    const name = profile.name.trim();
    // Flags obvious spam patterns like "Joe's Plumber - Best Cheap Emergency 24/7 Plumbing in Dallas"
    const spamDividers = [" - ", " | ", " : ", " -- "];
    const hasDivider = spamDividers.some((div) => name.includes(div));
    const words = name.split(/\s+/);

    if (hasDivider && words.length >= 7) {
      deductions += 3;
      findings.push({
        id: "acc_keyword_stuffing",
        categoryKey: "accuracy",
        ruleId: "name_stuffing",
        title: "Potential Keyword Stuffing in Business Name",
        description: "Google terms strictly forbid appending taglines, cities, or keywords to your legal real-world name.",
        evidence: `Business name is ${words.length} words long and includes delimiter characters: "${profile.name}".`,
        severity: "high",
        deduction: 3,
        recommendation: {
          title: "Align Business Name with Storefront Signage",
          problemDescription: "Keyword stuffing in the title is the #1 cause of manual hard suspensions by Google moderators.",
          suggestedAction: "Change the profile name to match your exact legal registration and exterior signage.",
          expectedBenefit: "Guards against profile suspension and ensures audit durability.",
          effort: "medium",
          manualConfirmationRequired: true,
          canAutomateThroughIntegration: true,
        },
      });
    } else {
      passedCount++;
    }
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
