# GBP Optimizer — AI-Powered Google Business Profile Audit & Optimization SaaS

GBP Optimizer is a production-oriented SaaS platform engineered for Local Business Owners, SEO Freelancers, and Digital Marketing Agencies. It automates Google Business Profile audits, computes an objective 100-point profile health score across 6 core categories, generates actionable prioritized recommendations, provides an AI content creation studio (with high-quality deterministic fallback), and generates client-ready printable audit reports.

---

## 1. System Architecture

```
[ User Browser / Client ]
       │
       ▼
[ Next.js 15 App Router Frontend & API ]
   ├── Public Pages (Landing, Features, Pricing, About, Contact, Privacy, Terms)
   ├── Auth System (WebCrypto PBKDF2 + SHA-256 + HTTP-only Cookie Sessions)
   ├── Tenant-Isolated Workspace Router (Role-based access: owner, freelancer, agency_admin)
   ├── Deterministic 100-Point Audit Engine (/lib/audit-engine)
   ├── SSRF Protection Guard (/lib/security/ssrf-guard)
   ├── AI Content Studio with Graceful Fallback (/lib/ai)
   └── Modular Google Integrations (OAuth 2.0, Places API, GBP API Interfaces)
       │
       ▼
[ Data Access Layer: Drizzle ORM + LibSQL / Cloudflare D1 ]
   ├── Local Dev & Tests: file:data/local.db
   └── Cloudflare Production: env.DB (Cloudflare D1 SQLite)
```

---

## 2. Deterministic 100-Point Scoring Model

The audit engine evaluates profiles across 6 weighted categories totaling 100 points:

| Category | Weight | Evaluated Rules & Evidence |
|---|---|---|
| **1. Profile Completeness** | **30 pts** | Business name, primary category, storefront address / service area, local phone, website URL, weekly operating hours schedule, 500+ character description, itemized services catalog, and featured products showcase. |
| **2. Information Accuracy** | **20 pts** | E.164 phone formatting, HTTPS protocol enforcement, sentence-case description (anti-spam / anti-CAPS), prohibition of raw links inside descriptions, city/zip geocoding precision, and keyword stuffing detection. |
| **3. Categories & Services** | **15 pts** | Primary category specificity (flags generic classifications like "Store"), secondary categories depth (2 to 5 recommended, max 9), and granular descriptive service labeling. |
| **4. Reviews Management** | **15 pts** | Review volume benchmarks (target >= 25), average star rating health (target >= 4.5), and merchant reply coverage on unanswered reviews (target >= 90%). |
| **5. Photos & Visual Content** | **10 pts** | Total photo count (target >= 20), daytime exterior storefront & signage photos, interior atmosphere media, and authentic team/staff photography. |
| **6. Website & Local SEO** | **10 pts** | SSRF-safe server-side URL validation, custom branded domain vs. free social host, homepage `<title>` tag presence & length, meta description, and `<h1>` hierarchy. |

> **Important Ranking Disclaimer:** GBP Optimizer helps identify incomplete, outdated, or poorly maintained profile fields to improve profile health, accuracy, and customer experience. A higher optimization score does not guarantee top Google Maps or search rankings, as organic rankings depend on geographic distance, competition, algorithm updates, and external factors outside any tool's control.

---

## 3. Database Schema (Cloudflare D1 / SQLite)

- **`users`**: User identity, role-based authorization, PBKDF2 password hashes, and salts.
- **`sessions`**: 256-bit cryptographically secure session tokens, SHA-256 token hashes, and expiration timestamps.
- **`workspaces`**: Tenant isolation boundaries (`free`, `pro`, `agency`).
- **`workspace_members`**: Organization memberships and permissions (`admin`, `editor`, `viewer`).
- **`businesses`**: Google Business Profile inventory, categories, contact information, hours, catalogs, and photo counts.
- **`business_locations`**: Multi-location support for franchises and multi-unit brands.
- **`audits`**: Historical audit records, overall scores (0-100), coverage percentages, and data sources.
- **`audit_category_scores`**: Category-level point breakdowns.
- **`audit_findings`**: Specific deficiencies, rule IDs, evidence snippets, severity tags, and deductions.
- **`recommendations`**: Interactive optimization checklist tasks with real-time status updates (`pending`, `in_progress`, `completed`, `dismissed`).
- **`generated_content`**: Audit and AI Studio copy generation log.
- **`integrations`**: Secure OAuth and third-party credential registry.

---

## 4. Security Architecture

1. **WebCrypto Password Derivation**: Implements PBKDF2 with 100,000 iterations and 16-byte random salts using standard `crypto.subtle`. Zero plaintext passwords.
2. **Session Security**: 256-bit random tokens stored hashed (`SHA-256`), transmitted exclusively via `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
3. **SSRF Guard**: Strict server-side URL validation before any website inspection. Rejects loopback (`127.0.0.1`, `localhost`, `::1`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), cloud metadata services (`169.254.169.254`), non-standard ports, and non-HTTP protocols.
4. **Tenant Isolation**: Every database query filters by `workspaceId` to prevent Insecure Direct Object References (IDOR).
5. **Input Validation**: Strict Zod schemas on all API inputs.

---

## 5. Quick Start & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```

### 3. Build & Run Application
```bash
npm run build
npm start
```

### 4. Demo Login Credentials
For instant access to sample data and reports without registration:
- **Email**: `demo@gbpoptimizer.com`
- **Password**: `Password123!`
- Or click the **"1-Click Demo Login"** button on the `/login` page.

---

## 6. Cloudflare Deployment Instructions

This project targets Cloudflare Workers / Pages using Cloudflare D1.

### 1. Create Cloudflare D1 Database
```bash
npx wrangler d1 create gbp-optimizer-db
```
Copy the generated `database_id` into `wrangler.jsonc`.

### 2. Apply Migrations
```bash
npx wrangler d1 execute gbp-optimizer-db --file=src/db/migrations/init.sql
```

### 3. Deploy via OpenNext / Cloudflare
```bash
npx @opennextjs/cloudflare
npx wrangler deploy
```

---

## 7. Environment Variables

Create `.env.local` for custom external connectors (all optional; MVP operates with deterministic fallbacks):

```env
# Database (defaults to local SQLite file:data/local.db)
DATABASE_URL="file:data/local.db"

# Optional: Google Gemini API for AI Content Studio
GEMINI_API_KEY=""

# Optional: Google Places API for location autocomplete
GOOGLE_PLACES_API_KEY=""

# Optional: Official Google OAuth 2.0 Credentials (Phase 2)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"
```
