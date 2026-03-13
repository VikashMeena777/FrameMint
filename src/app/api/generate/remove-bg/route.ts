import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const maxDuration = 60;

/**
 * POST /api/generate/remove-bg
 * Remove background from an uploaded image using HuggingFace model.
 *
 * Accepts: multipart/form-data with field "image" (file)
 * Returns: { imageUrl, format, sizeBytes }
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

    // Rate limit: 10 per minute
    const rl = checkRateLimit(`gen:${user.id}`, RATE_LIMITS.generation);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait.', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    // Check pro-tier access
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier, credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.tier === 'free') {
      return NextResponse.json(
        {
          error: 'Background removal requires a Pro or Enterprise plan',
          code: 'UPGRADE_REQUIRED',
        },
        { status: 403 }
      );
    }

    if (profile.credits_remaining < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' },
        { status: 403 }
      );
    }

    // Parse the uploaded file
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Call HuggingFace background removal model
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      return NextResponse.json(
        { error: 'Background removal service is not configured', code: 'SERVER_ERROR' },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Remove-bg error (${response.status}):`, errorText);

      if (response.status === 503) {
        return NextResponse.json(
          {
            error: 'Background removal model is loading. Please try again in ~30s.',
            code: 'MODEL_LOADING',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'Background removal failed', code: 'GENERATION_FAILED' },
        { status: 500 }
      );
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/png';

    // Upload to Supabase Storage
    const storageKey = `${user.id}/remove-bg/${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(storageKey, resultBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to save result', code: 'SERVER_ERROR' },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('thumbnails').getPublicUrl(storageKey);

    // Deduct 1 credit
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: 1,
      p_ref: null,
    });

    return NextResponse.json({
      imageUrl: publicUrl,
      format: 'png',
      sizeBytes: resultBuffer.length,
    });
  } catch (error) {
    console.error('Remove-bg error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
