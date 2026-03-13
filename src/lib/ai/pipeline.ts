import { enhancePrompt, PLATFORM_SIZES } from './groq';
import { generateMultipleImages } from './huggingface';
import { createClient } from '@/lib/supabase/server';
import type { ThumbnailStyle, Platform } from '@/types';

export interface GenerationParams {
  userId: string;
  title: string;
  style: ThumbnailStyle;
  platform: Platform;
  variants?: number;
}

export interface GenerationResult {
  id: string;
  title: string;
  status: 'completed' | 'failed';
  enhancedPrompt: string;
  suggestedText: string[];
  suggestedColors: string[];
  variants: {
    id: string;
    imageUrl: string;
    width: number;
    height: number;
    format: string;
    sizeBytes: number;
  }[];
  creditsUsed: number;
  creditsRemaining: number;
}

export async function generateThumbnail(
  params: GenerationParams
): Promise<GenerationResult> {
  const { userId, title, style, platform, variants: variantCount = 4 } = params;
  const supabase = await createClient();
  const { width, height } = PLATFORM_SIZES[platform];

  // 1. Create thumbnail record
  const { data: thumbnail, error: insertError } = await supabase
    .from('thumbnails')
    .insert({
      user_id: userId,
      title,
      prompt: title,
      style_preset: style,
      platform_preset: platform,
      status: 'generating',
    })
    .select('id')
    .single();

  if (insertError || !thumbnail) {
    throw new Error(`Failed to create thumbnail record: ${insertError?.message}`);
  }

  try {
    // 2. Enhance prompt via Groq
    const enhanced = await enhancePrompt(title, style, platform);

    // Update thumbnail with enhanced prompt
    await supabase
      .from('thumbnails')
      .update({ enhanced_prompt: enhanced.enhancedPrompt })
      .eq('id', thumbnail.id);

    // 3. Generate images via HuggingFace
    const images = await generateMultipleImages(
      {
        prompt: enhanced.enhancedPrompt,
        width,
        height,
      },
      Math.min(variantCount, 4)
    );

    // 4. Upload to Supabase Storage
    const uploadedVariants = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const storageKey = `thumbnails/${userId}/${thumbnail.id}/variant_${i + 1}.png`;

      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(storageKey, image.buffer, {
          contentType: image.contentType,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload variant ${i + 1} failed:`, uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(storageKey);

      uploadedVariants.push({
        storageKey,
        imageUrl: urlData.publicUrl,
        width,
        height,
        format: 'png',
        sizeBytes: image.buffer.byteLength,
      });
    }

    if (uploadedVariants.length === 0) {
      throw new Error('Failed to upload any variants');
    }

    // 5. Save variant records
    const { data: savedVariants, error: variantError } = await supabase
      .from('thumbnail_variants')
      .insert(
        uploadedVariants.map((v) => ({
          thumbnail_id: thumbnail.id,
          image_url: v.imageUrl,
          storage_key: v.storageKey,
          width: v.width,
          height: v.height,
          format: v.format,
          file_size_bytes: v.sizeBytes,
        }))
      )
      .select('id, image_url, width, height, format, file_size_bytes');

    if (variantError) {
      console.error('Failed to save variants:', variantError);
    }

    // 6. Deduct 1 credit atomically
    const { data: creditResult } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: 1,
      p_ref: thumbnail.id,
    });

    if (creditResult === false) {
      // Rollback: clean up the thumbnail
      await supabase.from('thumbnails').delete().eq('id', thumbnail.id);
      await supabase.storage
        .from('thumbnails')
        .remove(uploadedVariants.map((v) => v.storageKey));
      throw new Error('Insufficient credits');
    }

    // 7. Mark as completed
    await supabase
      .from('thumbnails')
      .update({ status: 'completed' })
      .eq('id', thumbnail.id);

    // 8. Get remaining credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('user_id', userId)
      .single();

    return {
      id: thumbnail.id,
      title,
      status: 'completed',
      enhancedPrompt: enhanced.enhancedPrompt,
      suggestedText: enhanced.suggestedText,
      suggestedColors: enhanced.suggestedColors,
      variants: (savedVariants || []).map((v) => ({
        id: v.id,
        imageUrl: v.image_url,
        width: v.width,
        height: v.height,
        format: v.format,
        sizeBytes: v.file_size_bytes || 0,
      })),
      creditsUsed: 1,
      creditsRemaining: profile?.credits_remaining ?? 0,
    };
  } catch (error) {
    // Mark as failed
    await supabase
      .from('thumbnails')
      .update({ status: 'failed', metadata: { error: String(error) } })
      .eq('id', thumbnail.id);
    throw error;
  }
}
