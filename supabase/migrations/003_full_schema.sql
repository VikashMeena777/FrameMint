-- FrameMint — Migration 003: Remaining schema from 04-database-schema.md
-- Adds: workspaces, workspace_members, brand_kits, video_extractions, ab_tests
-- Alters: thumbnail_variants (add gdrive columns), thumbnails (add workspace_id)

-- ==========================================================
-- 1. WORKSPACES
-- ==========================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);

-- ==========================================================
-- 2. WORKSPACE MEMBERS
-- ==========================================================
CREATE TABLE IF NOT EXISTS workspace_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role         TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('owner','admin','member')),
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ws_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ws_members_workspace ON workspace_members(workspace_id);

-- ==========================================================
-- 3. BRAND KITS
-- ==========================================================
CREATE TABLE IF NOT EXISTS brand_kits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  colors       JSONB DEFAULT '[]',    -- array of hex codes
  fonts        JSONB DEFAULT '[]',    -- array of font names
  logo_url     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_kits_workspace ON brand_kits(workspace_id);

-- ==========================================================
-- 4. VIDEO EXTRACTIONS
-- ==========================================================
CREATE TABLE IF NOT EXISTS video_extractions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  thumbnail_id       UUID REFERENCES thumbnails(id) ON DELETE SET NULL,
  youtube_url        TEXT NOT NULL,
  video_title        TEXT,
  key_frames         JSONB DEFAULT '[]',   -- [{url, timestamp_sec, gdrive_path}]
  selected_frame_url TEXT,
  frame_count        INT DEFAULT 0,
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','extracting','completed','failed')),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_ext_user ON video_extractions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_ext_thumb ON video_extractions(thumbnail_id);

-- ==========================================================
-- 5. AB TESTS
-- ==========================================================
CREATE TABLE IF NOT EXISTS ab_tests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  variant_a_id      UUID REFERENCES thumbnail_variants(id) ON DELETE CASCADE NOT NULL,
  variant_b_id      UUID REFERENCES thumbnail_variants(id) ON DELETE CASCADE NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','completed','archived')),
  impressions_a     INT NOT NULL DEFAULT 0,
  impressions_b     INT NOT NULL DEFAULT 0,
  clicks_a          INT NOT NULL DEFAULT 0,
  clicks_b          INT NOT NULL DEFAULT 0,
  winner_variant_id UUID REFERENCES thumbnail_variants(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ab_user ON ab_tests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ab_status ON ab_tests(status) WHERE status = 'active';

-- ==========================================================
-- 6. ALTER EXISTING TABLES
-- ==========================================================

-- Add GDrive columns to thumbnail_variants (04-database-schema.md uses gdrive_file_id + gdrive_path)
ALTER TABLE thumbnail_variants
  ADD COLUMN IF NOT EXISTS gdrive_file_id TEXT,
  ADD COLUMN IF NOT EXISTS gdrive_path TEXT;

CREATE INDEX IF NOT EXISTS idx_variants_gdrive ON thumbnail_variants(gdrive_file_id);

-- Add workspace_id to thumbnails
ALTER TABLE thumbnails
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- ==========================================================
-- 7. RLS POLICIES FOR NEW TABLES
-- ==========================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own workspaces" ON workspaces
  FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see their workspaces" ON workspace_members
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners manage members" ON workspace_members
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace members see brand kits" ON brand_kits
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Owners manage brand kits" ON brand_kits
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

ALTER TABLE video_extractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own video extractions" ON video_extractions
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own ab tests" ON ab_tests
  FOR ALL USING (auth.uid() = user_id);

-- Workspace members can see workspace thumbnails (from 04-database-schema.md §3)
CREATE POLICY "Workspace members see thumbnails" ON thumbnails
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );
