const HF_API_URL = 'https://api-inference.huggingface.co/models';

// Models in priority order — try fast models first, fall back to slower ones
const MODELS = [
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-xl-base-1.0',
] as const;

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

export async function generateImage(
  options: GenerateImageOptions
): Promise<GeneratedImage> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not configured');
  }

  const { prompt, negativePrompt, width, height } = options;

  // Clamp dimensions to model limits
  const clampedWidth = Math.min(Math.max(width, 256), 1024);
  const clampedHeight = Math.min(Math.max(height, 256), 1024);

  const defaultNegative =
    'text, watermark, logo, letters, words, blurry, low quality, deformed, ugly, nsfw, duplicate, morbid, mutilated';

  for (const model of MODELS) {
    try {
      const response = await fetch(`${HF_API_URL}/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: negativePrompt || defaultNegative,
            width: clampedWidth,
            height: clampedHeight,
            num_inference_steps: model.includes('schnell') ? 4 : 30,
            guidance_scale: model.includes('schnell') ? 0 : 7.5,
          },
        }),
      });

      // Model loading — wait and retry
      if (response.status === 503) {
        const body = await response.json().catch(() => null);
        const estimatedTime = body?.estimated_time || 30;
        console.log(`Model ${model} loading, waiting ${estimatedTime}s...`);
        await sleep(Math.min(estimatedTime * 1000, 60000));
        // Retry once
        const retryResponse = await fetch(`${HF_API_URL}/${model}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              negative_prompt: negativePrompt || defaultNegative,
              width: clampedWidth,
              height: clampedHeight,
              num_inference_steps: model.includes('schnell') ? 4 : 30,
              guidance_scale: model.includes('schnell') ? 0 : 7.5,
            },
          }),
        });

        if (retryResponse.ok) {
          const arrayBuffer = await retryResponse.arrayBuffer();
          return {
            buffer: Buffer.from(arrayBuffer),
            contentType: retryResponse.headers.get('content-type') || 'image/png',
          };
        }
        continue; // Try next model
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'unknown error');
        console.error(`HF model ${model} error (${response.status}):`, errorText);
        continue; // Try next model
      }

      const arrayBuffer = await response.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        contentType: response.headers.get('content-type') || 'image/png',
      };
    } catch (error) {
      console.error(`HF model ${model} failed:`, error);
      continue; // Try next model
    }
  }

  throw new Error('All image generation models failed. Please try again later.');
}

export async function generateMultipleImages(
  options: GenerateImageOptions,
  count: number
): Promise<GeneratedImage[]> {
  // Generate images sequentially to avoid rate limits on free tier
  const results: GeneratedImage[] = [];
  for (let i = 0; i < count; i++) {
    // Add slight variation to prompt for each variant
    const variantPrompt =
      i === 0
        ? options.prompt
        : `${options.prompt}, variation ${i + 1}, different composition and color scheme`;
    try {
      const image = await generateImage({ ...options, prompt: variantPrompt });
      results.push(image);
    } catch (error) {
      console.error(`Variant ${i + 1} generation failed:`, error);
      // Continue with remaining variants
    }
  }

  if (results.length === 0) {
    throw new Error('Failed to generate any image variants');
  }

  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
