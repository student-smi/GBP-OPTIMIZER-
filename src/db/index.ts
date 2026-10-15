import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

// Ensure data directory exists
const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "local.db");
const client = createClient({
  url: process.env.DATABASE_URL || `file:${dbPath}`,
});

export const db = drizzle(client, { schema });

/**
 * Initializes the database tables with foreign keys and indexes.
 * Cloudflare D1 / SQLite DDL matching Drizzle schema.
 */
export async function initDatabase() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'owner',
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS sessions_token_hash_idx ON sessions(token_hash);

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL DEFAULT 'free',
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'editor',
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS workspace_members_ws_user_idx ON workspace_members(workspace_id, user_id);

    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      primary_category TEXT NOT NULL,
      additional_categories TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'US',
      phone TEXT,
      website TEXT,
      description TEXT,
      opening_hours TEXT,
      services TEXT,
      products TEXT,
      attributes TEXT,
      photos_count INTEGER DEFAULT 0,
      exterior_photos INTEGER DEFAULT 0,
      interior_photos INTEGER DEFAULT 0,
      team_photos INTEGER DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      average_rating INTEGER DEFAULT 0,
      unanswered_reviews INTEGER DEFAULT 0,
      is_service_area_business INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS businesses_workspace_idx ON businesses(workspace_id);

    CREATE TABLE IF NOT EXISTS business_locations (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      location_name TEXT NOT NULL,
      store_code TEXT,
      address TEXT NOT NULL,
      phone TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS business_locations_business_idx ON business_locations(business_id);

    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      overall_score INTEGER NOT NULL,
      coverage_percentage INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      data_source TEXT NOT NULL DEFAULT 'manual',
      audit_timestamp INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS audits_business_idx ON audits(business_id);
    CREATE INDEX IF NOT EXISTS audits_workspace_idx ON audits(workspace_id);

    CREATE TABLE IF NOT EXISTS audit_category_scores (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
      category_key TEXT NOT NULL,
      category_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      weight INTEGER NOT NULL,
      findings_count INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS audit_category_scores_audit_idx ON audit_category_scores(audit_id);

    CREATE TABLE IF NOT EXISTS audit_findings (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
      category_key TEXT NOT NULL,
      rule_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      evidence TEXT NOT NULL,
      severity TEXT NOT NULL,
      deduction INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS audit_findings_audit_cat_idx ON audit_findings(audit_id, category_key);

    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      finding_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      action_steps TEXT NOT NULL,
      expected_benefit TEXT NOT NULL,
      effort TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      can_automate INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS recommendations_biz_status_idx ON recommendations(business_id, status);
    CREATE INDEX IF NOT EXISTS recommendations_workspace_idx ON recommendations(workspace_id);

    CREATE TABLE IF NOT EXISTS generated_content (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      prompt TEXT NOT NULL,
      content TEXT NOT NULL,
      model_used TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS generated_content_biz_type_idx ON generated_content(business_id, type);

    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0,
      config TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS integrations_ws_provider_idx ON integrations(workspace_id, provider);

    CREATE TABLE IF NOT EXISTS geo_grid_scans (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      keyword TEXT NOT NULL,
      grid_size TEXT NOT NULL DEFAULT '3x3',
      radius_km INTEGER NOT NULL DEFAULT 5,
      average_rank INTEGER NOT NULL,
      top_3_percentage INTEGER NOT NULL,
      share_of_local_voice INTEGER NOT NULL,
      pins_data TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS geo_grid_scans_biz_idx ON geo_grid_scans(business_id);
    CREATE INDEX IF NOT EXISTS geo_grid_scans_ws_idx ON geo_grid_scans(workspace_id);
  `);
}
