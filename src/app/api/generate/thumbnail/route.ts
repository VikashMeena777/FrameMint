import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateThumbnail } from '@/lib/ai/pipeline';
import { generateThumbnailSchema } from '@/lib/validations/generate';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const maxDuration = 60; // Allow up to 60s for generation

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

    // Run the AI generation pipeline
    const result = await generateThumbnail({
      userId: user.id,
      title: parsed.data.title,
      style: parsed.data.style,
      platform: parsed.data.platform,
      variants: parsed.data.variants,
    });

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
