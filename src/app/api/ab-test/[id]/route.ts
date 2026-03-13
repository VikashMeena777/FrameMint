import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateCTR, analyzeTest } from '@/lib/ab-test/stats';

/**
 * GET /api/ab-test/[id]
 * Get A/B test results with CTR and winner analysis.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data: test, error } = await supabase
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !test) {
      return NextResponse.json(
        { error: 'A/B test not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const analysis = analyzeTest(
      { impressions: test.impressions_a, clicks: test.clicks_a },
      { impressions: test.impressions_b, clicks: test.clicks_b }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variantA = test.variant_a as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variantB = test.variant_b as any;

    return NextResponse.json({
      id: test.id,
      status: test.status,
      variantA: {
        id: variantA?.id,
        image_url: variantA?.image_url,
        width: variantA?.width,
        height: variantA?.height,
        impressions: test.impressions_a,
        clicks: test.clicks_a,
        ctr: analysis.ctrA,
      },
      variantB: {
        id: variantB?.id,
        image_url: variantB?.image_url,
        width: variantB?.width,
        height: variantB?.height,
        impressions: test.impressions_b,
        clicks: test.clicks_b,
        ctr: analysis.ctrB,
      },
      winner: analysis.winner,
      confidence: analysis.confidence,
      createdAt: test.created_at,
      completedAt: test.completed_at,
    });
  } catch (error) {
    console.error('AB test fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
