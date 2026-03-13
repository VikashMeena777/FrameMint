import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 1×1 transparent PNG pixel (68 bytes)
const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

/**
 * GET /api/ab-test/pixel/[id]
 * Tracking pixel — records an impression for the specified variant.
 * Used in emails, embeds, or external pages.
 *
 * Query: ?v=a or ?v=b
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const variant = searchParams.get('v');

  // Always return the pixel (even on errors) to avoid broken images
  const pixelResponse = () =>
    new NextResponse(TRANSPARENT_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': String(TRANSPARENT_PIXEL.length),
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

  if (!variant || !['a', 'b'].includes(variant)) {
    return pixelResponse();
  }

  try {
    const supabase = await createClient();

    // Verify test exists and is active
    const { data: test } = await supabase
      .from('ab_tests')
      .select('id, status, impressions_a, impressions_b')
      .eq('id', id)
      .single();

    if (!test || test.status !== 'active') {
      return pixelResponse();
    }

    // Increment impression counter
    const column = variant === 'a' ? 'impressions_a' : 'impressions_b';

    // Try atomic RPC first
    const { error: rpcError } = await supabase.rpc('increment_ab_counter', {
      p_test_id: id,
      p_column: column,
    });

    if (rpcError) {
      // Fallback: direct increment
      const currentValue =
        variant === 'a' ? test.impressions_a : test.impressions_b;
      await supabase
        .from('ab_tests')
        .update({ [column]: currentValue + 1 })
        .eq('id', id);
    }
  } catch (error) {
    console.error('Pixel tracking error:', error);
    // Don't fail the response — always return the pixel
  }

  return pixelResponse();
}

// Edge runtime for fastest pixel response
export const runtime = 'nodejs';
