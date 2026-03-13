-- ================================================
-- 002_payment_orders.sql
-- Payment order tracking for Cashfree integration
-- ================================================

CREATE TABLE IF NOT EXISTS public.payment_orders (
  id            text PRIMARY KEY,                     -- our order ID (FM_PRO_xxx)
  cf_order_id   text,                                 -- Cashfree's order ID
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan          text NOT NULL CHECK (plan IN ('pro', 'enterprise')),
  amount        numeric(10,2) NOT NULL,
  status        text NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING', 'ACTIVE', 'PAID', 'EXPIRED', 'TERMINATED', 'FAILED')),
  cf_payment_id text,                                 -- Cashfree payment ID once paid
  paid_at       timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON public.payment_orders(user_id);

-- Index for webhook lookups by Cashfree order ID
CREATE INDEX IF NOT EXISTS idx_payment_orders_cf ON public.payment_orders(cf_order_id);

-- RLS: users can only see their own orders
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.payment_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage orders"
  ON public.payment_orders FOR ALL
  USING (auth.role() = 'service_role');
