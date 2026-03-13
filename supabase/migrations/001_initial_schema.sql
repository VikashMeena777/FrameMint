-- FrameMint — Initial Database Schema
-- Run in Supabase SQL Editor or via `supabase db push`

-- ==========================================================
-- 1. PROFILES
-- ==========================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name         TEXT,
  avatar_url           TEXT,
  tier                 TEXT NOT NULL DEFAULT 'free'
                       CHECK (tier IN ('free','pro','enterprise')),
  credits_remaining    INT NOT NULL DEFAULT 5,
  credits_monthly_limit INT NOT NULL DEFAULT 5,
  credits_reset_at     TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  preferences          JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 2. THUMBNAILS
-- ==========================================================
CREATE TABLE IF NOT EXISTS thumbnails (
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

CREATE INDEX IF NOT EXISTS idx_thumbnails_user ON thumbnails(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thumbnails_status ON thumbnails(status);

-- ==========================================================
-- 3. THUMBNAIL VARIANTS
-- ==========================================================
CREATE TABLE IF NOT EXISTS thumbnail_variants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thumbnail_id    UUID REFERENCES thumbnails(id) ON DELETE CASCADE NOT NULL,
  image_url       TEXT NOT NULL,
  storage_key     TEXT NOT NULL,
  width           INT NOT NULL,
  height          INT NOT NULL,
  format          TEXT NOT NULL DEFAULT 'png',
  file_size_bytes INT,
  is_favourite    BOOLEAN DEFAULT FALSE,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variants_thumbnail ON thumbnail_variants(thumbnail_id);

-- ==========================================================
-- 4. CREDIT TRANSACTIONS
-- ==========================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount       INT NOT NULL, -- positive = credit, negative = debit
  type         TEXT NOT NULL
               CHECK (type IN ('monthly_refill','generation','purchase','refund','bonus')),
  description  TEXT,
  reference_id UUID,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_user ON credit_transactions(user_id, created_at DESC);

-- ==========================================================
-- 5. SUBSCRIPTIONS
-- ==========================================================
CREATE TABLE IF NOT EXISTS subscriptions (
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

CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);

-- ==========================================================
-- 6. ROW LEVEL SECURITY
-- ==========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE thumbnails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own thumbnails" ON thumbnails
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE thumbnail_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own variants" ON thumbnail_variants
  FOR ALL USING (
    thumbnail_id IN (
      SELECT id FROM thumbnails WHERE user_id = auth.uid()
    )
  );

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own credits" ON credit_transactions
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================================
-- 7. FUNCTIONS
-- ==========================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  -- Initial credit grant
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 5, 'bonus', 'Welcome bonus — 5 free credits');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Deduct credits atomically
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INT, p_ref UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_remaining INT;
BEGIN
  SELECT credits_remaining INTO v_remaining
  FROM profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_remaining < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles
  SET credits_remaining = credits_remaining - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, reference_id, description)
  VALUES (p_user_id, -p_amount, 'generation', p_ref, 'Thumbnail generation');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Monthly credit refill (call via cron or Edge Function)
CREATE OR REPLACE FUNCTION refill_credits()
RETURNS void AS $$
BEGIN
  -- Log refills
  INSERT INTO credit_transactions (user_id, amount, type, description)
  SELECT user_id, credits_monthly_limit, 'monthly_refill', 'Monthly credit refill'
  FROM profiles WHERE credits_reset_at <= NOW();

  -- Reset credits
  UPDATE profiles
  SET credits_remaining = credits_monthly_limit,
      credits_reset_at = NOW() + INTERVAL '30 days',
      updated_at = NOW()
  WHERE credits_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
