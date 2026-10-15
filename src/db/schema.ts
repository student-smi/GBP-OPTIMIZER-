import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  salt: text("salt").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["owner", "freelancer", "agency_admin", "client"] })
    .default("owner")
    .notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    tokenHashIdx: index("sessions_token_hash_idx").on(table.tokenHash),
  })
);

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan", { enum: ["free", "pro", "agency"] })
    .default("free")
    .notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const workspaceMembers = sqliteTable(
  "workspace_members",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["admin", "editor", "viewer"] })
      .default("editor")
      .notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    workspaceUserIdx: index("workspace_members_ws_user_idx").on(table.workspaceId, table.userId),
  })
);

export const businesses = sqliteTable(
  "businesses",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    primaryCategory: text("primary_category").notNull(),
    additionalCategories: text("additional_categories"), // JSON string array
    address: text("address"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country").default("US"),
    phone: text("phone"),
    website: text("website"),
    description: text("description"),
    openingHours: text("opening_hours"), // JSON string
    services: text("services"), // JSON string array
    products: text("products"), // JSON string array
    attributes: text("attributes"), // JSON string
    photosCount: integer("photos_count").default(0),
    exteriorPhotos: integer("exterior_photos").default(0),
    interiorPhotos: integer("interior_photos").default(0),
    teamPhotos: integer("team_photos").default(0),
    reviewCount: integer("review_count").default(0),
    averageRating: integer("average_rating").default(0), // stored as integer * 10 (e.g. 48 for 4.8)
    unansweredReviews: integer("unanswered_reviews").default(0),
    isServiceAreaBusiness: integer("is_service_area_business", { mode: "boolean" }).default(false),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    workspaceIdx: index("businesses_workspace_idx").on(table.workspaceId),
  })
);

export const businessLocations = sqliteTable(
  "business_locations",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    locationName: text("location_name").notNull(),
    storeCode: text("store_code"),
    address: text("address").notNull(),
    phone: text("phone"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    businessIdx: index("business_locations_business_idx").on(table.businessId),
  })
);

export const audits = sqliteTable(
  "audits",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    overallScore: integer("overall_score").notNull(),
    coveragePercentage: integer("coverage_percentage").notNull(),
    status: text("status", { enum: ["completed", "in_progress", "failed"] })
      .default("completed")
      .notNull(),
    dataSource: text("data_source", { enum: ["manual", "places_api", "gbp_connected"] })
      .default("manual")
      .notNull(),
    auditTimestamp: integer("audit_timestamp").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    businessIdx: index("audits_business_idx").on(table.businessId),
    workspaceIdx: index("audits_workspace_idx").on(table.workspaceId),
  })
);

export const auditCategoryScores = sqliteTable(
  "audit_category_scores",
  {
    id: text("id").primaryKey(),
    auditId: text("audit_id")
      .notNull()
      .references(() => audits.id, { onDelete: "cascade" }),
    categoryKey: text("category_key").notNull(),
    categoryName: text("category_name").notNull(),
    score: integer("score").notNull(),
    maxScore: integer("max_score").notNull(),
    weight: integer("weight").notNull(),
    findingsCount: integer("findings_count").notNull(),
  },
  (table) => ({
    auditIdx: index("audit_category_scores_audit_idx").on(table.auditId),
  })
);

export const auditFindings = sqliteTable(
  "audit_findings",
  {
    id: text("id").primaryKey(),
    auditId: text("audit_id")
      .notNull()
      .references(() => audits.id, { onDelete: "cascade" }),
    categoryKey: text("category_key").notNull(),
    ruleId: text("rule_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    evidence: text("evidence").notNull(),
    severity: text("severity", { enum: ["critical", "high", "medium", "low"] }).notNull(),
    deduction: integer("deduction").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    auditCategoryIdx: index("audit_findings_audit_cat_idx").on(table.auditId, table.categoryKey),
  })
);

export const recommendations = sqliteTable(
  "recommendations",
  {
    id: text("id").primaryKey(),
    auditId: text("audit_id")
      .notNull()
      .references(() => audits.id, { onDelete: "cascade" }),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    findingId: text("finding_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    actionSteps: text("action_steps").notNull(),
    expectedBenefit: text("expected_benefit").notNull(),
    effort: text("effort", { enum: ["low", "medium", "high"] }).notNull(),
    severity: text("severity", { enum: ["critical", "high", "medium", "low"] }).notNull(),
    status: text("status", { enum: ["pending", "in_progress", "completed", "dismissed"] })
      .default("pending")
      .notNull(),
    canAutomate: integer("can_automate", { mode: "boolean" }).default(false).notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    businessStatusIdx: index("recommendations_biz_status_idx").on(table.businessId, table.status),
    workspaceIdx: index("recommendations_workspace_idx").on(table.workspaceId),
  })
);

export const generatedContent = sqliteTable(
  "generated_content",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["description", "review_reply", "post", "service", "seo"] }).notNull(),
    prompt: text("prompt").notNull(),
    content: text("content").notNull(),
    modelUsed: text("model_used").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    businessTypeIdx: index("generated_content_biz_type_idx").on(table.businessId, table.type),
  })
);

export const integrations = sqliteTable(
  "integrations",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    provider: text("provider", { enum: ["google_oauth", "google_places", "gemini"] }).notNull(),
    isActive: integer("is_active", { mode: "boolean" }).default(false).notNull(),
    config: text("config"), // JSON string containing secure tokens or settings
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    workspaceProviderIdx: index("integrations_ws_provider_idx").on(table.workspaceId, table.provider),
  })
);

export const geoGridScans = sqliteTable(
  "geo_grid_scans",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    gridSize: text("grid_size").notNull().default("3x3"),
    radiusKm: integer("radius_km").notNull().default(5),
    averageRank: integer("average_rank").notNull(), // stored as integer * 10 (e.g. 24 for 2.4)
    top3Percentage: integer("top_3_percentage").notNull(),
    shareOfLocalVoice: integer("share_of_local_voice").notNull(),
    pinsData: text("pins_data").notNull(), // JSON string array of pins
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    businessIdx: index("geo_grid_scans_biz_idx").on(table.businessId),
    workspaceIdx: index("geo_grid_scans_ws_idx").on(table.workspaceId),
  })
);

