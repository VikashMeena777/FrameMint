import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enhancePrompt } from '@/lib/ai/groq';
import { enhancePromptSchema } from '@/lib/validations/generate';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

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

    // Rate limit: 10 per minute
    const rl = checkRateLimit(`gen:${user.id}`, RATE_LIMITS.generation);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait.', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = enhancePromptSchema.safeParse(body);

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

    const result = await enhancePrompt(
      parsed.data.title,
      parsed.data.style,
      'youtube' // Default platform for prompt-only enhancement
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Prompt enhancement error:', error);
    return NextResponse.json(
      {
        error: 'Prompt enhancement failed',
        code: 'GENERATION_FAILED',
      },
      { status: 500 }
    );
  }
}
