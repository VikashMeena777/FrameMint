import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * POST /api/ab-test/[id]/impression
 * Record an impression for variant A or B.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const variant = body.variant as string;

    if (!variant || !['a', 'b'].includes(variant)) {
      return NextResponse.json(
        { error: 'variant must be "a" or "b"', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // Rate limit: 100 per minute per test
    const rl = checkRateLimit(`ab:${id}`, RATE_LIMITS.abTracking);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // Verify test exists and is active
    const { data: test } = await supabase
      .from('ab_tests')
      .select('id, status, impressions_a, impressions_b')
      .eq('id', id)
      .single();

    if (!test) {
      return NextResponse.json(
        { error: 'A/B test not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (test.status !== 'active') {
      return NextResponse.json(
        { error: 'A/B test is not active', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // Atomic increment via RPC
    const column = variant === 'a' ? 'impressions_a' : 'impressions_b';
    const { error: rpcError } = await supabase.rpc('increment_ab_counter', {
      p_test_id: id,
      p_column: column,
    });

    if (rpcError) {
      console.warn('increment_ab_counter RPC failed, using fallback:', rpcError.message);
      // Fallback: non-atomic increment
      const currentValue = (test as Record<string, number>)[column] || 0;
      await supabase
        .from('ab_tests')
        .update({ [column]: currentValue + 1 })
        .eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('AB test impression error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
