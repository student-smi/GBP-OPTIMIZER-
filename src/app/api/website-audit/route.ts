import { NextResponse } from "next/server";
import { validatePublicWebsiteUrl } from "@/lib/security/ssrf-guard";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    const ssrfCheck = validatePublicWebsiteUrl(url);
    if (!ssrfCheck.isValid || !ssrfCheck.sanitizedUrl) {
      return NextResponse.json(
        { error: ssrfCheck.error || "Invalid or restricted URL" },
        { status: 400 }
      );
    }

    const targetUrl = ssrfCheck.sanitizedUrl;
    const isHttps = targetUrl.startsWith("https://");

    // Fetch page content with strict timeout and redirect limits
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GBPOptimizerBot/1.0; +https://gbpoptimizer.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(6000), // 6 second timeout
    });

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        url: targetUrl,
        isHttps,
        accessible: false,
        statusCode: response.status,
        issues: [`Website returned HTTP error status: ${response.status}`],
      });
    }

    const html = await response.text();

    // Extract Title Tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Extract Meta Description
    const metaDescMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
    );
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;

    // Extract H1 Headings
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    const h1Count = h1Matches.length;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!isHttps) {
      issues.push("Website does not use secure HTTPS protocol.");
      recommendations.push("Enable SSL/TLS certificate on your web host.");
    }

    if (!title) {
      issues.push("Missing <title> tag on homepage.");
      recommendations.push("Add a descriptive title tag containing your business name, primary service, and city.");
    } else if (title.length < 30 || title.length > 60) {
      issues.push(`Title tag length is ${title.length} characters (recommended: 40–60 characters).`);
      recommendations.push("Optimize title tag length to fit Google search result snippets without truncation.");
    }

    if (!metaDescription) {
      issues.push("Missing meta description.");
      recommendations.push("Add a compelling 150-160 character meta description explaining your local services.");
    }

    if (h1Count === 0) {
      issues.push("Missing main <h1> heading.");
      recommendations.push("Include a single clear <h1> headline describing your primary business specialty.");
    } else if (h1Count > 1) {
      issues.push(`Multiple <h1> headings found (${h1Count}). Best practice is a single primary <h1>.`);
      recommendations.push("Consolidate multiple <h1> tags into a single main page heading.");
    }

    return NextResponse.json({
      success: true,
      url: targetUrl,
      isHttps,
      accessible: true,
      title,
      metaDescription,
      h1Count,
      issues,
      recommendations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to inspect website" },
      { status: 500 }
    );
  }
}
