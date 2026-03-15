import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateThumbnail } from '@/lib/ai/pipeline';
import { generateThumbnailSchema } from '@/lib/validations/generate';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const maxDuration = 120; // Allow up to 120s for generation (HF models can be slow)

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

    // Rate limit: 10 generations per minute
    const rl = checkRateLimit(`gen:${user.id}`, RATE_LIMITS.generation);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before generating again.', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const parsed = generateThumbnailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          code: 'INVALID_INPUT',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Check credits before starting
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.credits_remaining < 1) {
      return NextResponse.json(
        {
          error: 'Insufficient credits. Upgrade your plan for more.',
          code: 'INSUFFICIENT_CREDITS',
        },
        { status: 403 }
      );
    }

    // Bug #6 fix: Deduct credit BEFORE generation to prevent race condition
    const { data: creditResult } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: 1,
      p_ref: `pre-gen-${Date.now()}`,
    });

    if (creditResult === false) {
      return NextResponse.json(
        {
          error: 'Insufficient credits. Upgrade your plan for more.',
          code: 'INSUFFICIENT_CREDITS',
        },
        { status: 403 }
      );
    }

    // Run the AI generation pipeline (credit already deducted)
    let result;
    try {
      result = await generateThumbnail({
        userId: user.id,
        title: parsed.data.title,
        style: parsed.data.style,
        platform: parsed.data.platform,
        variants: parsed.data.variants,
        skipCreditDeduction: true, // Credit already deducted above
      });
    } catch (genError) {
      // Refund credit on generation failure
      console.error('[Route] Generation failed, refunding credit...');
      try {
        await supabase.rpc('refund_credits', {
          p_user_id: user.id,
          p_amount: 1,
        });
      } catch {
        // If refund RPC doesn't exist, manually increment
        await supabase.from('profiles')
          .update({ credits_remaining: profile.credits_remaining })
          .eq('user_id', user.id);
      }
      throw genError;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Thumbnail generation error:', error);

    const message =
      error instanceof Error ? error.message : 'Generation failed';

    if (message === 'Insufficient credits') {
      return NextResponse.json(
        { error: message, code: 'INSUFFICIENT_CREDITS' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: message, code: 'GENERATION_FAILED' },
      { status: 500 }
    );
  }
}
