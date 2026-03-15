import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/ab-test/list
 * List all A/B tests for the current user.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { data: tests, error } = await supabase
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
        variant_a:variant_a_id (id, image_url),
        variant_b:variant_b_id (id, image_url)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('AB test list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tests', code: 'SERVER_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tests: (tests || []).map((t) => {
        const ctrA = t.impressions_a > 0 ? t.clicks_a / t.impressions_a : 0;
        const ctrB = t.impressions_b > 0 ? t.clicks_b / t.impressions_b : 0;
        return {
          id: t.id,
          status: t.status,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variantA: { ...(t.variant_a as any), impressions: t.impressions_a, clicks: t.clicks_a, ctr: ctrA },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variantB: { ...(t.variant_b as any), impressions: t.impressions_b, clicks: t.clicks_b, ctr: ctrB },
          winner: t.winner_variant_id,
          createdAt: t.created_at,
          completedAt: t.completed_at,
        };
      }),
    });
  } catch (error) {
    console.error('AB test list error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
