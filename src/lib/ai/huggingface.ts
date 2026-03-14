const HF_API_URL = 'https://router.huggingface.co/hf-inference/models';

// Models in priority order — most reliable free-tier models first
const MODELS = [
  'stabilityai/stable-diffusion-xl-base-1.0',
  'runwayml/stable-diffusion-v1-5',
] as const;

// Max wait time for a single model attempt (ms)
const REQUEST_TIMEOUT = 120_000; // 2 minutes
const MODEL_LOAD_WAIT = 30_000;  // 30 seconds for model loading
const MAX_RETRIES = 2;

interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
}

interface GeneratedImage {
  buffer: Buffer;
  contentType: string;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function generateImage(
  options: GenerateImageOptions
): Promise<GeneratedImage> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not configured');
  }

  const { prompt, negativePrompt, width, height } = options;

  // Clamp dimensions to safe model limits (multiples of 8)
  const clampedWidth = Math.min(Math.max(Math.round(width / 8) * 8, 256), 1024);
  const clampedHeight = Math.min(Math.max(Math.round(height / 8) * 8, 256), 1024);

  const defaultNegative =
    'text, watermark, logo, letters, words, blurry, low quality, deformed, ugly, nsfw, duplicate, morbid, mutilated';

  const errors: string[] = [];

  for (const model of MODELS) {
    const isSDXL = model.includes('stable-diffusion-xl');
    const payload = {
      inputs: prompt,
      parameters: {
        negative_prompt: negativePrompt || defaultNegative,
        width: isSDXL ? clampedWidth : Math.min(clampedWidth, 768),
        height: isSDXL ? clampedHeight : Math.min(clampedHeight, 768),
        num_inference_steps: isSDXL ? 25 : 30,
        guidance_scale: 7.5,
      },
    };

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`[HF] Trying ${model} (attempt ${attempt + 1}/${MAX_RETRIES})...`);

        const response = await fetchWithTimeout(
          `${HF_API_URL}/${model}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
          },
          REQUEST_TIMEOUT
        );

        // Model is loading — wait and retry
        if (response.status === 503) {
          const body = await response.json().catch(() => ({}));
          const waitTime = Math.min((body?.estimated_time || 20) * 1000, MODEL_LOAD_WAIT);
          console.log(`[HF] Model ${model} loading, waiting ${Math.round(waitTime / 1000)}s...`);
          await sleep(waitTime);
          continue; // Retry this model
        }

        // Rate limited
        if (response.status === 429) {
          console.warn(`[HF] Rate limited on ${model}, waiting 10s...`);
          await sleep(10000);
          continue;
        }

        // Auth error
        if (response.status === 401 || response.status === 403) {
          const errText = await response.text().catch(() => '');
          errors.push(`${model}: Auth error ${response.status} — ${errText}`);
          console.error(`[HF] Auth error on ${model}:`, errText);
          break; // Don't retry auth errors, skip to next model
        }

        // Other error
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          errors.push(`${model}: HTTP ${response.status} — ${errorText}`);
          console.error(`[HF] ${model} error (${response.status}):`, errorText);
          continue;
        }

        // Check content type — make sure we got an image
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.startsWith('image/')) {
          const bodyText = await response.text().catch(() => '');
          errors.push(`${model}: Got ${contentType} instead of image — ${bodyText.substring(0, 200)}`);
          console.error(`[HF] ${model} returned non-image content type: ${contentType}`);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength < 1000) {
          errors.push(`${model}: Image too small (${arrayBuffer.byteLength} bytes)`);
          console.error(`[HF] ${model} returned suspiciously small image`);
          continue;
        }

        console.log(`[HF] Success with ${model} — ${arrayBuffer.byteLength} bytes`);
        return {
          buffer: Buffer.from(arrayBuffer),
          contentType,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('abort')) {
          errors.push(`${model}: Timeout after ${REQUEST_TIMEOUT / 1000}s`);
          console.error(`[HF] ${model} timed out`);
        } else {
          errors.push(`${model}: ${msg}`);
          console.error(`[HF] ${model} exception:`, msg);
        }
      }
    }
  }

  throw new Error(
    `All image generation models failed.\n${errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')}`
  );
}

export async function generateMultipleImages(
  options: GenerateImageOptions,
  count: number
): Promise<GeneratedImage[]> {
  const results: GeneratedImage[] = [];
  const errors: string[] = [];

  // Generate images sequentially to avoid rate limits on free tier
  for (let i = 0; i < count; i++) {
    // Add slight variation for each variant after the first
    const variantPrompt =
      i === 0
        ? options.prompt
        : `${options.prompt}, variation ${i + 1}, different angle and lighting`;
    try {
      console.log(`[Pipeline] Generating variant ${i + 1}/${count}...`);
      const image = await generateImage({ ...options, prompt: variantPrompt });
      results.push(image);
      console.log(`[Pipeline] Variant ${i + 1} generated successfully`);

      // Small delay between requests to avoid rate limits
      if (i < count - 1) {
        await sleep(2000);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`Variant ${i + 1}: ${msg}`);
      console.error(`[Pipeline] Variant ${i + 1} failed:`, msg);
      // If the first variant fails, reduce count to avoid wasting time
      if (i === 0 && count > 2) {
        console.log(`[Pipeline] First variant failed, reducing to 2 attempts total`);
        count = 2;
      }
    }
  }

  if (results.length === 0) {
    throw new Error(
      `Failed to generate any image variants.\n${errors.join('\n')}`
    );
  }

  console.log(`[Pipeline] Generated ${results.length}/${count} variants successfully`);
  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
