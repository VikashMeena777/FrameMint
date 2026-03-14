-- ============================================================
-- FrameMint — COMPLETE DATABASE SETUP (Clean Install)
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase → SQL Editor → New query
-- 2. Paste this ENTIRE file
-- 3. Click Run
-- ============================================================


-- ==========================================================
-- STEP 0: CLEAN SLATE — Drop everything if it exists
-- ==========================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS deduct_credits(UUID, INT, UUID);
DROP FUNCTION IF EXISTS refill_credits();
DROP FUNCTION IF EXISTS increment_ab_counter(UUID, TEXT);

DROP POLICY IF EXISTS "Users own ab tests" ON ab_tests;
DROP POLICY IF EXISTS "Users own video extractions" ON video_extractions;
DROP POLICY IF EXISTS "Owners manage brand kits" ON brand_kits;
DROP POLICY IF EXISTS "Workspace members see brand kits" ON brand_kits;
DROP POLICY IF EXISTS "Owners manage members" ON workspace_members;
DROP POLICY IF EXISTS "Members see their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Users own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace members see thumbnails" ON thumbnails;
DROP POLICY IF EXISTS "Service role can manage orders" ON payment_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON payment_orders;
DROP POLICY IF EXISTS "Users own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users own credits" ON credit_transactions;
DROP POLICY IF EXISTS "Users see own variants" ON thumbnail_variants;
DROP POLICY IF EXISTS "Users own thumbnails" ON thumbnails;
DROP POLICY IF EXISTS "Users own profile" ON profiles;

DROP TABLE IF EXISTS ab_tests CASCADE;
DROP TABLE IF EXISTS video_extractions CASCADE;
DROP TABLE IF EXISTS brand_kits CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS payment_orders CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS thumbnail_variants CASCADE;
DROP TABLE IF EXISTS thumbnails CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;


-- ==========================================================
-- STEP 1: PROFILES
-- ==========================================================
CREATE TABLE public.profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name          TEXT,
  avatar_url            TEXT,
  tier                  TEXT NOT NULL DEFAULT 'free'
                        CHECK (tier IN ('free','pro','enterprise')),
  credits_remaining     INT NOT NULL DEFAULT 5,
  credits_monthly_limit INT NOT NULL DEFAULT 5,
  credits_reset_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  preferences           JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);


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
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_thumbnails_user ON public.thumbnails(user_id, created_at DESC);
CREATE INDEX idx_thumbnails_status ON public.thumbnails(status);


-- ==========================================================
-- STEP 3: THUMBNAIL VARIANTS
-- ==========================================================
CREATE TABLE public.thumbnail_variants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thumbnail_id    UUID REFERENCES public.thumbnails(id) ON DELETE CASCADE NOT NULL,
  image_url       TEXT NOT NULL,
  storage_key     TEXT NOT NULL,
  width           INT NOT NULL,
  height          INT NOT NULL,
  format          TEXT NOT NULL DEFAULT 'png',
  file_size_bytes INT,
  is_favourite    BOOLEAN DEFAULT FALSE,
  gdrive_file_id  TEXT,
  gdrive_path     TEXT,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variants_thumbnail ON public.thumbnail_variants(thumbnail_id);
CREATE INDEX idx_variants_gdrive ON public.thumbnail_variants(gdrive_file_id);


-- ==========================================================
-- STEP 4: CREDIT TRANSACTIONS
-- ==========================================================
CREATE TABLE public.credit_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount       INT NOT NULL,
  type         TEXT NOT NULL
               CHECK (type IN ('monthly_refill','generation','purchase','refund','bonus')),
  description  TEXT,
  reference_id UUID,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credits_user ON public.credit_transactions(user_id, created_at DESC);


-- ==========================================================
-- STEP 5: SUBSCRIPTIONS
-- ==========================================================
CREATE TABLE public.subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider                 TEXT NOT NULL CHECK (provider IN ('cashfree','stripe')),
  provider_subscription_id TEXT NOT NULL,
  plan                     TEXT NOT NULL CHECK (plan IN ('pro','enterprise')),
  status                   TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','cancelled','past_due','trialing')),
  current_period_start     TIMESTAMPTZ,
  current_period_end       TIMESTAMPTZ,
  cancelled_at             TIMESTAMPTZ,
  metadata                 JSONB DEFAULT '{}',
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subs_user ON public.subscriptions(user_id);


-- ==========================================================
-- STEP 6: PAYMENT ORDERS
-- ==========================================================
CREATE TABLE public.payment_orders (
  id            TEXT PRIMARY KEY,
  cf_order_id   TEXT,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL CHECK (plan IN ('pro', 'enterprise')),
  amount        NUMERIC(10,2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING', 'ACTIVE', 'PAID', 'EXPIRED', 'TERMINATED', 'FAILED')),
  cf_payment_id TEXT,
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX idx_payment_orders_cf ON public.payment_orders(cf_order_id);


-- ==========================================================
-- STEP 7: WORKSPACES
-- ==========================================================
CREATE TABLE public.workspaces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workspaces_owner ON public.workspaces(owner_id);


-- ==========================================================
-- STEP 8: WORKSPACE MEMBERS
-- ==========================================================
CREATE TABLE public.workspace_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role         TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('owner','admin','member')),
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_ws_members_user ON public.workspace_members(user_id);
CREATE INDEX idx_ws_members_workspace ON public.workspace_members(workspace_id);


-- ==========================================================
-- STEP 9: BRAND KITS
-- ==========================================================
CREATE TABLE public.brand_kits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  colors       JSONB DEFAULT '[]',
  fonts        JSONB DEFAULT '[]',
  logo_url     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_kits_workspace ON public.brand_kits(workspace_id);


-- ==========================================================
-- STEP 10: VIDEO EXTRACTIONS
-- ==========================================================
CREATE TABLE public.video_extractions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  thumbnail_id       UUID REFERENCES public.thumbnails(id) ON DELETE SET NULL,
  youtube_url        TEXT NOT NULL,
  video_title        TEXT,
  key_frames         JSONB DEFAULT '[]',
  selected_frame_url TEXT,
  frame_count        INT DEFAULT 0,
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','extracting','completed','failed')),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_ext_user ON public.video_extractions(user_id, created_at DESC);
CREATE INDEX idx_video_ext_thumb ON public.video_extractions(thumbnail_id);


-- ==========================================================
-- STEP 11: AB TESTS
-- ==========================================================
CREATE TABLE public.ab_tests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  variant_a_id      UUID REFERENCES public.thumbnail_variants(id) ON DELETE CASCADE NOT NULL,
  variant_b_id      UUID REFERENCES public.thumbnail_variants(id) ON DELETE CASCADE NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','completed','archived')),
  impressions_a     INT NOT NULL DEFAULT 0,
  impressions_b     INT NOT NULL DEFAULT 0,
  clicks_a          INT NOT NULL DEFAULT 0,
  clicks_b          INT NOT NULL DEFAULT 0,
  winner_variant_id UUID REFERENCES public.thumbnail_variants(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

CREATE INDEX idx_ab_user ON public.ab_tests(user_id, created_at DESC);
CREATE INDEX idx_ab_status ON public.ab_tests(status) WHERE status = 'active';


-- Add workspace_id to thumbnails
ALTER TABLE public.thumbnails
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;


-- ==========================================================
-- STEP 12: ROW LEVEL SECURITY
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own profile" ON public.profiles
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.thumbnails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own thumbnails" ON public.thumbnails
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.thumbnail_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own variants" ON public.thumbnail_variants
  FOR ALL USING (
    thumbnail_id IN (
      SELECT id FROM public.thumbnails WHERE user_id = auth.uid()
    )
  );

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own credits" ON public.credit_transactions
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own subscriptions" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.payment_orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage orders" ON public.payment_orders
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own workspaces" ON public.workspaces
  FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see their workspaces" ON public.workspace_members
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners manage members" ON public.workspace_members
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace members see brand kits" ON public.brand_kits
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Owners manage brand kits" ON public.brand_kits
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

ALTER TABLE public.video_extractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own video extractions" ON public.video_extractions
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own ab tests" ON public.ab_tests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Workspace members see thumbnails" ON public.thumbnails
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );


-- ==========================================================
-- STEP 13: FUNCTIONS
-- ==========================================================

-- Auto-create profile on signup (FIXED: explicit public. schema + search_path)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 5, 'bonus', 'Welcome bonus - 5 free credits');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- Deduct credits atomically
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INT, p_ref UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_remaining INT;
BEGIN
  SELECT credits_remaining INTO v_remaining
  FROM public.profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_remaining < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
  SET credits_remaining = credits_remaining - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, reference_id, description)
  VALUES (p_user_id, -p_amount, 'generation', p_ref, 'Thumbnail generation');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Monthly credit refill (called by cron)
CREATE OR REPLACE FUNCTION refill_credits()
RETURNS void AS $$
BEGIN
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  SELECT user_id, credits_monthly_limit, 'monthly_refill', 'Monthly credit refill'
  FROM public.profiles WHERE credits_reset_at <= NOW();

  UPDATE public.profiles
  SET credits_remaining = credits_monthly_limit,
      credits_reset_at = NOW() + INTERVAL '30 days',
      updated_at = NOW()
  WHERE credits_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- AB test counter increment
CREATE OR REPLACE FUNCTION increment_ab_counter(p_test_id UUID, p_column TEXT)
RETURNS VOID AS $$
BEGIN
  IF p_column NOT IN ('impressions_a', 'impressions_b', 'clicks_a', 'clicks_b') THEN
    RAISE EXCEPTION 'Invalid column: %', p_column;
  END IF;

  EXECUTE format(
    'UPDATE public.ab_tests SET %I = %I + 1 WHERE id = $1',
    p_column, p_column
  ) USING p_test_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================
-- DONE! All tables, policies, and functions created.
-- ============================================================
