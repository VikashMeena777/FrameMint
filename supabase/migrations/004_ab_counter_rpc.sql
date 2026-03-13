-- ================================================
-- 004_ab_counter_rpc.sql
-- Atomic increment for A/B test counters
-- ================================================

-- increment_ab_counter: atomically increment a counter column on ab_tests.
-- p_column must be one of: 'impressions_a', 'impressions_b', 'clicks_a', 'clicks_b'
CREATE OR REPLACE FUNCTION increment_ab_counter(p_test_id UUID, p_column TEXT)
RETURNS VOID AS $$
BEGIN
  -- Whitelist allowed column names to prevent SQL injection
  IF p_column NOT IN ('impressions_a', 'impressions_b', 'clicks_a', 'clicks_b') THEN
    RAISE EXCEPTION 'Invalid column: %', p_column;
  END IF;

  EXECUTE format(
    'UPDATE ab_tests SET %I = %I + 1, updated_at = NOW() WHERE id = $1',
    p_column, p_column
  ) USING p_test_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
