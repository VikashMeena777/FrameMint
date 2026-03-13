import { createClient } from '@/lib/supabase/server';

/**
 * Record an impression for an A/B test variant.
 * Uses atomic increment to avoid race conditions.
 */
export async function recordImpression(testId: string, variant: 'a' | 'b') {
  const supabase = await createClient();
  const column = variant === 'a' ? 'impressions_a' : 'impressions_b';

  const { error } = await supabase.rpc('increment_ab_counter', {
    p_test_id: testId,
    p_column: column,
  });

  if (error) {
    console.error(`Failed to record impression for ${testId}:`, error);
    throw new Error('Failed to record impression');
  }
}

/**
 * Record a click for an A/B test variant.
 */
export async function recordClick(testId: string, variant: 'a' | 'b') {
  const supabase = await createClient();
  const column = variant === 'a' ? 'clicks_a' : 'clicks_b';

  const { error } = await supabase.rpc('increment_ab_counter', {
    p_test_id: testId,
    p_column: column,
  });

  if (error) {
    console.error(`Failed to record click for ${testId}:`, error);
    throw new Error('Failed to record click');
  }
}

/**
 * Get A/B test data with calculated CTR.
 */
export async function getTestResults(testId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ab_tests')
    .select(
      `
      id,
      status,
      impressions_a,
      impressions_b,
      clicks_a,
      clicks_b,
      winner_variant_id,
      created_at,
      completed_at,
      variant_a:variant_a_id (id, image_url, width, height),
      variant_b:variant_b_id (id, image_url, width, height)
    `
    )
    .eq('id', testId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
