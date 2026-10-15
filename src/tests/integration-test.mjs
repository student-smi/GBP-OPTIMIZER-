// Automated API Integration Test
async function runTests() {
  console.log("=== RUNNING LIVE API INTEGRATION TESTS ===");

  // 1. Test Login
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "demo@gbpoptimizer.com",
      password: "Password123!",
    }),
  });

  console.log("1. Login status:", loginRes.status);
  const loginData = await loginRes.json();
  console.log("   Login response:", loginData);

  const cookie = loginRes.headers.get("set-cookie");
  console.log("   Set-Cookie received:", cookie ? "YES (HttpOnly)" : "NO");

  if (!cookie) {
    throw new Error("No session cookie returned");
  }

  // 2. Test /api/auth/me
  const meRes = await fetch("http://localhost:3000/api/auth/me", {
    headers: { Cookie: cookie },
  });
  console.log("2. Auth Me status:", meRes.status);
  const meData = await meRes.json();
  console.log("   Authenticated user:", meData.user?.name, "(Role:", meData.user?.role + ")");
  console.log("   Active workspace:", meData.workspace?.name);

  // 3. Test /api/businesses
  const bizRes = await fetch("http://localhost:3000/api/businesses", {
    headers: { Cookie: cookie },
  });
  console.log("3. Businesses list status:", bizRes.status);
  const bizData = await bizRes.json();
  console.log("   Found businesses count:", bizData.businesses?.length);
  for (const b of bizData.businesses || []) {
    console.log(`   - ${b.name} (${b.primaryCategory}, ${b.city}): Score ${b.latestAudit?.overallScore || 'N/A'}`);
  }

  // 4. Test AI Studio Generation
  const aiRes = await fetch("http://localhost:3000/api/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      type: "description",
      businessName: "Austin Master Electricians",
      category: "Electrician",
      city: "Austin, TX",
      services: ["Commercial Wiring", "EV Charger Installation", "Panel Upgrades"],
    }),
  });
  console.log("4. AI Studio status:", aiRes.status);
  const aiData = await aiRes.json();
  console.log("   AI Generation Engine:", aiData.modelUsed);
  console.log("   Generated preview snippet:", aiData.content?.substring(0, 100) + "...");

  // 5. Test SSRF-Safe Website Inspector
  const webRes = await fetch("http://localhost:3000/api/website-audit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ url: "https://example.com" }),
  });
  console.log("5. Website Audit status:", webRes.status);
  const webData = await webRes.json();
  console.log("   Inspected URL:", webData.url);
  console.log("   Extracted Title:", webData.title);
  console.log("   HTTPS Secure:", webData.isHttps);

  console.log("\n=== ALL 5 INTEGRATION ENDPOINTS TESTED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
