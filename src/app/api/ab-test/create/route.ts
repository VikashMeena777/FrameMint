import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateCTR, analyzeTest } from '@/lib/ab-test/stats';

/**
 * POST /api/ab-test/create
 * Create an A/B test from two thumbnail variants.
 */
export async function POST(request: Request) {
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

    const body = await request.json();
    const { variantAId, variantBId } = body;

    if (!variantAId || !variantBId) {
      return NextResponse.json(
        {
          error: 'variantAId and variantBId are required',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    if (variantAId === variantBId) {
      return NextResponse.json(
        { error: 'Variants must be different', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // Verify both variants belong to the user
    const { data: variants } = await supabase
      .from('thumbnail_variants')
      .select('id, thumbnail_id, image_url, thumbnails!inner(user_id)')
      .in('id', [variantAId, variantBId]);

    if (!variants || variants.length !== 2) {
      return NextResponse.json(
        { error: 'One or both variants not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Create the A/B test
    const { data: test, error } = await supabase
      .from('ab_tests')
      .insert({
        user_id: user.id,
        variant_a_id: variantAId,
        variant_b_id: variantBId,
        status: 'active',
      })
      .select('id, status, created_at')
      .single();

    if (error || !test) {
      console.error('AB test creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create A/B test', code: 'SERVER_ERROR' },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://framemint.com';

    return NextResponse.json({
      id: test.id,
      status: test.status,
      shareLinks: {
        a: `${baseUrl}/t/${test.id}?v=a`,
        b: `${baseUrl}/t/${test.id}?v=b`,
      },
      createdAt: test.created_at,
    });
  } catch (error) {
    console.error('AB test create error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
