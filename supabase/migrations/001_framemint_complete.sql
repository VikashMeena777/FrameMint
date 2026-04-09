-- ============================================================
-- FrameMint — COMPLETE DATABASE SCHEMA
--
-- Single file for the Supabase SQL Editor.
-- Drops EVERYTHING first, then creates all tables, indexes,
-- RLS policies, RPC functions, and the auto-profile trigger.
--
-- INSTRUCTIONS:
--   1. Open Supabase → SQL Editor → New query
--   2. Paste this ENTIRE file
--   3. Click "Run"
-- ============================================================


-- ==========================================================
-- STEP 0: CLEAN SLATE — Drop everything that may exist
-- ==========================================================

-- Functions & triggers first (depend on tables)
DROP TRIGGER  IF EXISTS on_auth_user_created          ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user()              CASCADE;
DROP FUNCTION IF EXISTS deduct_credits(UUID, INT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS refund_credits(UUID, INT)       CASCADE;
DROP FUNCTION IF EXISTS increment_credits(UUID, INT)    CASCADE;
DROP FUNCTION IF EXISTS refill_credits()                CASCADE;

DROP FUNCTION IF EXISTS cleanup_orphan_thumbnails()     CASCADE;

-- Tables (child → parent order so FKs don't block)

DROP TABLE IF EXISTS video_extractions   CASCADE;
DROP TABLE IF EXISTS payment_orders      CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS thumbnail_variants  CASCADE;
DROP TABLE IF EXISTS thumbnails          CASCADE;
DROP TABLE IF EXISTS brand_kits          CASCADE;
DROP TABLE IF EXISTS workspace_members   CASCADE;
DROP TABLE IF EXISTS workspaces          CASCADE;
DROP TABLE IF EXISTS subscriptions       CASCADE;
DROP TABLE IF EXISTS profiles            CASCADE;


-- ==========================================================
-- STEP 1: PROFILES
-- ==========================================================
CREATE TABLE public.profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name          TEXT,
  full_name             TEXT,
  avatar_url            TEXT,
  tier                  TEXT NOT NULL DEFAULT 'free'               -- plan tier: free / pro / enterprise
                        CHECK (tier IN ('free','pro','enterprise')),
  credits_remaining     INT  NOT NULL DEFAULT 5,
  credits_monthly_limit INT  NOT NULL DEFAULT 5,
  credits_reset_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  preferences           JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own profile"
  ON profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ==========================================================
-- STEP 2: THUMBNAILS
-- ==========================================================
CREATE TABLE public.thumbnails (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title            TEXT NOT NULL,
  prompt           TEXT NOT NULL,
  enhanced_prompt  TEXT,
  style_preset     TEXT NOT NULL,
  platform_preset  TEXT NOT NULL DEFAULT 'youtube',
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','generating','completed','failed')),
  is_favourite     BOOLEAN NOT NULL DEFAULT FALSE,
  variant_count    INT  NOT NULL DEFAULT 0,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_thumbnails_user_id    ON thumbnails(user_id);
CREATE INDEX idx_thumbnails_created_at ON thumbnails(created_at DESC);
CREATE INDEX idx_thumbnails_status     ON thumbnails(status);

ALTER TABLE thumbnails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own thumbnails"
  ON thumbnails FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ==========================================================
-- STEP 3: THUMBNAIL VARIANTS
-- ==========================================================
CREATE TABLE public.thumbnail_variants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thumbnail_id     UUID REFERENCES thumbnails(id) ON DELETE CASCADE NOT NULL,
  image_url        TEXT NOT NULL,
  storage_key      TEXT,
  gdrive_path      TEXT,
  width            INT  NOT NULL DEFAULT 0,
  height           INT  NOT NULL DEFAULT 0,
  format           TEXT NOT NULL DEFAULT 'png',
  file_size_bytes  INT,
  expires_at       TIMESTAMPTZ,              -- used by cleanup-storage cron
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variants_thumbnail_id ON thumbnail_variants(thumbnail_id);
CREATE INDEX idx_variants_expires_at   ON thumbnail_variants(expires_at)
  WHERE expires_at IS NOT NULL;

ALTER TABLE thumbnail_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own variants"
  ON thumbnail_variants FOR ALL
  USING (
    thumbnail_id IN (
      SELECT id FROM thumbnails WHERE user_id = auth.uid()
    )
  );


-- ==========================================================
-- STEP 4: PAYMENT ORDERS
-- ==========================================================
CREATE TABLE public.payment_orders (
  id             TEXT PRIMARY KEY,                        -- app-generated order ID
  cf_order_id    TEXT,                                    -- Cashfree order ID
  cf_payment_id  TEXT,                                    -- Cashfree payment ID
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan           TEXT NOT NULL,
  amount         NUMERIC(10,2) NOT NULL,
  status         TEXT NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING','PAID','FAILED','REFUNDED')),
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);

ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Users can only read their own orders
CREATE POLICY "Users can view own orders"
  ON payment_orders FOR SELECT
  USING (auth.uid() = user_id);

-- Service role (webhooks / server) can do anything — no policy needed,
-- service_role bypasses RLS automatically.


-- ==========================================================
-- STEP 5: CREDIT TRANSACTIONS
-- ==========================================================
CREATE TABLE public.credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount      INT  NOT NULL,                              -- positive = add, negative = deduct
  type        TEXT NOT NULL
              CHECK (type IN ('generation','purchase','monthly_refill','refund','bonus')),
  description TEXT,
  ref_id      TEXT,                                       -- optional reference (thumbnail id, order id, etc.)
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credits_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credits_type    ON credit_transactions(type);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own credits"
  ON credit_transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);





-- ==========================================================
-- STEP 7: VIDEO EXTRACTIONS
-- ==========================================================
CREATE TABLE public.video_extractions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  youtube_url   TEXT NOT NULL,
  video_title   TEXT,
  key_frames    JSONB DEFAULT '[]',
  frame_count   INT  NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','processing','completed','failed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_extractions_user_id ON video_extractions(user_id);

ALTER TABLE video_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own video extractions"
  ON video_extractions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ==========================================================
-- STEP 7b: SUBSCRIPTIONS
-- ==========================================================
CREATE TABLE public.subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider                 TEXT NOT NULL
                           CHECK (provider IN ('cashfree','stripe')),
  provider_subscription_id TEXT NOT NULL,
  plan                     TEXT NOT NULL
                           CHECK (plan IN ('pro','enterprise')),
  status                   TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','cancelled','past_due','trialing')),
  current_period_start     TIMESTAMPTZ,
  current_period_end       TIMESTAMPTZ,
  cancelled_at             TIMESTAMPTZ,
  metadata                 JSONB DEFAULT '{}',
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subs_user ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own subscriptions"
  ON subscriptions FOR ALL
  USING (auth.uid() = user_id);


-- ==========================================================
-- STEP 7c: WORKSPACES
-- ==========================================================
CREATE TABLE public.workspaces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own workspaces"
  ON workspaces FOR ALL
  USING (auth.uid() = owner_id);


-- ==========================================================
-- STEP 7d: WORKSPACE MEMBERS
-- ==========================================================
CREATE TABLE public.workspace_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role         TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('owner','admin','member')),
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_ws_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_ws_members_user      ON workspace_members(user_id);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage members"
  ON workspace_members FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Members see their workspaces"
  ON workspace_members FOR SELECT
  USING (auth.uid() = user_id);


-- ==========================================================
-- STEP 7e: BRAND KITS
-- ==========================================================
CREATE TABLE public.brand_kits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  colors       JSONB DEFAULT '[]',
  fonts        JSONB DEFAULT '[]',
  logo_url     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_kits_workspace ON brand_kits(workspace_id);

ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage brand kits"
  ON brand_kits FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members see brand kits"
  ON brand_kits FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );


-- ==========================================================
-- STEP 8: RPC — deduct_credits
-- Atomically deducts credits; returns FALSE if insufficient.
-- ==========================================================
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount  INT,
  p_ref     TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_remaining INT;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT credits_remaining INTO v_remaining
    FROM profiles
   WHERE user_id = p_user_id
   FOR UPDATE;

  IF v_remaining IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_remaining < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles
     SET credits_remaining = credits_remaining - p_amount,
         updated_at        = NOW()
   WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, description, ref_id)
  VALUES (p_user_id, -p_amount, 'generation', 'Thumbnail generation', p_ref);

  RETURN TRUE;
END;
$$;


-- ==========================================================
-- STEP 9: RPC — refund_credits
-- Adds back credits after a failed generation.
-- ==========================================================
CREATE OR REPLACE FUNCTION refund_credits(
  p_user_id UUID,
  p_amount  INT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
     SET credits_remaining = LEAST(credits_remaining + p_amount, credits_monthly_limit),
         updated_at        = NOW()
   WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'refund', 'Generation refund');
END;
$$;


-- ==========================================================
-- STEP 10: RPC — increment_credits
-- Simple credit increment (fallback path in thumbnail route).
-- ==========================================================
CREATE OR REPLACE FUNCTION increment_credits(
  p_user_id UUID,
  p_amount  INT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
     SET credits_remaining = LEAST(credits_remaining + p_amount, credits_monthly_limit),
         updated_at        = NOW()
   WHERE user_id = p_user_id;
END;
$$;


-- ==========================================================
-- STEP 11: RPC — refill_credits
-- Monthly cron: resets credits for users whose reset date has passed.
-- ==========================================================
CREATE OR REPLACE FUNCTION refill_credits()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Find users whose reset date has passed and refill them
  UPDATE profiles
     SET credits_remaining = credits_monthly_limit,
         credits_reset_at  = NOW() + INTERVAL '30 days',
         updated_at        = NOW()
   WHERE credits_reset_at <= NOW();

  -- Log transactions for each refilled user
  INSERT INTO credit_transactions (user_id, amount, type, description)
  SELECT user_id, credits_monthly_limit, 'monthly_refill', 'Monthly credit refill'
    FROM profiles
   WHERE credits_reset_at > NOW()                        -- just updated above
     AND credits_reset_at <= NOW() + INTERVAL '1 minute'; -- within last minute
END;
$$;





-- ==========================================================
-- STEP 13: RPC — cleanup_orphan_thumbnails
-- Deletes thumbnails that have zero remaining variants.
-- Called by the cleanup-storage cron.
-- ==========================================================
CREATE OR REPLACE FUNCTION cleanup_orphan_thumbnails()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM thumbnails t
   WHERE NOT EXISTS (
     SELECT 1 FROM thumbnail_variants v WHERE v.thumbnail_id = t.id
   )
   AND t.status = 'completed';
END;
$$;


-- ==========================================================
-- STEP 14: TRIGGER — Auto-create profile on user sign-up
-- ==========================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    display_name,
    full_name,
    avatar_url,
    tier,
    credits_remaining,
    credits_monthly_limit,
    credits_reset_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name',  NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name',  NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    'free',
    5,
    5,
    NOW() + INTERVAL '30 days'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ==========================================================
-- DONE ✓
-- ==========================================================
-- Tables:  profiles, thumbnails, thumbnail_variants,
--          payment_orders, credit_transactions,
--          video_extractions, subscriptions,
--          workspaces, workspace_members, brand_kits
--
-- RPCs:    deduct_credits, refund_credits, increment_credits,
--          refill_credits, cleanup_orphan_thumbnails
--
-- Trigger: on_auth_user_created → handle_new_user()
-- ==========================================================
