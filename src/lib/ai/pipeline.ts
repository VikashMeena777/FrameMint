import { enhancePrompt, PLATFORM_SIZES } from './groq';
import { generateMultipleImages } from './huggingface';
import { uploadThumbnail, cleanupTempFile, deleteFile } from '@/lib/storage/gdrive';
import { createClient } from '@/lib/supabase/server';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import os from 'os';
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

  // Track GDrive paths for rollback
  const uploadedGDrivePaths: string[] = [];

  try {
    // 2. Enhance prompt via Groq
    console.log('[Pipeline] Step 2: Enhancing prompt via Groq...');
    const enhanced = await enhancePrompt(title, style, platform);

    // Update thumbnail with enhanced prompt
    await supabase
      .from('thumbnails')
      .update({ enhanced_prompt: enhanced.enhancedPrompt })
      .eq('id', thumbnail.id);

    // 3. Generate images via HuggingFace
    console.log('[Pipeline] Step 3: Generating images via HuggingFace...');
    const images = await generateMultipleImages(
      {
        prompt: enhanced.enhancedPrompt,
        width,
        height,
      },
      Math.min(variantCount, 4)
    );

    // 4. Upload to Google Drive via rclone
    console.log('[Pipeline] Step 4: Uploading to Google Drive...');
    const uploadedVariants = [];
    const tempDir = path.join(os.tmpdir(), 'framemint', thumbnail.id);
    mkdirSync(tempDir, { recursive: true });

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filename = `variant_${i + 1}.png`;
      const tempFilePath = path.join(tempDir, filename);
      const gdriveRemotePath = `${userId}/thumbnails/${thumbnail.id}/${filename}`;

      try {
        // Write buffer to temp file
        writeFileSync(tempFilePath, image.buffer);
        console.log(`[Pipeline] Uploading variant ${i + 1} to GDrive...`);

        // Upload to GDrive (creates file + share link)
        await uploadThumbnail(
          userId,
          thumbnail.id,
          tempFilePath,
          filename
        );

        uploadedGDrivePaths.push(gdriveRemotePath);

        // Use our own proxy URL to avoid CORS issues with direct GDrive URLs
        // The proxy route fetches from GDrive server-side and serves to browser
        const imageUrl = `/api/storage/image/${gdriveRemotePath}`;

        uploadedVariants.push({
          storageKey: gdriveRemotePath,
          imageUrl,
          width,
          height,
          format: 'png',
          sizeBytes: image.buffer.byteLength,
        });

        console.log(`[Pipeline] Variant ${i + 1} uploaded successfully`);
      } catch (uploadError) {
        console.error(`[Pipeline] Upload variant ${i + 1} failed:`, uploadError);
        // Continue with other variants
      } finally {
        // Clean up temp file
        cleanupTempFile(tempFilePath);
      }
    }

    if (uploadedVariants.length === 0) {
      throw new Error('Failed to upload any variants to Google Drive');
    }

    // 5. Save variant records in Supabase
    console.log('[Pipeline] Step 5: Saving variant records...');
    const { data: savedVariants, error: variantError } = await supabase
      .from('thumbnail_variants')
      .insert(
        uploadedVariants.map((v) => ({
          thumbnail_id: thumbnail.id,
          image_url: v.imageUrl,
          storage_key: v.storageKey,
          gdrive_path: v.storageKey,
          width: v.width,
          height: v.height,
          format: v.format,
          file_size_bytes: v.sizeBytes,
        }))
      )
      .select('id, image_url, width, height, format, file_size_bytes');

    if (variantError) {
      console.error('[Pipeline] Failed to save variants:', variantError);
    }

    // 6. Deduct 1 credit atomically
    console.log('[Pipeline] Step 6: Deducting credits...');
    const { data: creditResult } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: 1,
      p_ref: thumbnail.id,
    });

    if (creditResult === false) {
      // Rollback: clean up from GDrive and database
      console.warn('[Pipeline] Insufficient credits — rolling back...');
      await supabase.from('thumbnails').delete().eq('id', thumbnail.id);
      for (const gdrivePath of uploadedGDrivePaths) {
        try {
          await deleteFile(gdrivePath);
        } catch {
          console.error(`[Pipeline] Failed to rollback GDrive file: ${gdrivePath}`);
        }
      }
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

    console.log(`[Pipeline] Done! ${uploadedVariants.length} variants generated.`);

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Pipeline] Generation failed:', errorMessage);
    // Mark as failed
    await supabase
      .from('thumbnails')
      .update({ status: 'failed', metadata: { error: errorMessage } })
      .eq('id', thumbnail.id);
    throw new Error(`Generation failed\n\n${errorMessage}`);
  }
}
