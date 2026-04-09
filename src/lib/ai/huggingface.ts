/**
 * Pollinations.ai image generation — free with API key.
 *
 * Uses TWO methods (with automatic fallback):
 *   1. POST /v1/images/generations (OpenAI-compatible, returns URL → fetch image)
 *   2. GET  /image/{prompt}?key=... (direct image response, fallback)
 *
 * Model priority: flux → zimage
 *
 * Get your free API key at: https://enter.pollinations.ai
 */

// ---------------------------------------------------------------------------
// Public types (unchanged API)
// ---------------------------------------------------------------------------

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  guidanceScale?: number;
  inferenceSteps?: number;
}

export interface GeneratedImage {
  buffer: Buffer;
  contentType: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REQUEST_TIMEOUT = 120_000;
const MAX_RETRIES = 2;
const POLLINATIONS_MODELS = ['flux', 'zimage'] as const;

// ---------------------------------------------------------------------------
// Method 1: POST /v1/images/generations (OpenAI-compatible)
// Returns a URL that we then fetch to get the actual image bytes.
// ---------------------------------------------------------------------------

async function tryPost(
  options: GenerateImageOptions,
  model: string,
): Promise<GeneratedImage | null> {
  const { prompt, negativePrompt, width, height } = options;
  const w = clampSize(width);
  const h = clampSize(height);
  const seed = randomSeed();
  const apiKey = process.env.POLLINATIONS_API_KEY;

  if (!apiKey) return null; // POST requires auth

  let fullPrompt = prompt;
  if (negativePrompt) fullPrompt += `\n\nNegative: ${negativePrompt}`;

  console.log(`[Pollinations] POST model="${model}" ${w}x${h} seed=${seed}`);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`[Pollinations] POST ${model} attempt ${attempt + 1}/${MAX_RETRIES}`);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const res = await fetch('https://gen.pollinations.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          model,
          n: 1,
          size: `${w}x${h}`,
          response_format: 'url',
          seed,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[Pollinations] POST ${model} HTTP ${res.status}: ${errText.substring(0, 300)}`);
        if ([401, 402, 403].includes(res.status)) return null; // fatal
        if (res.status === 429) { await sleep(10000); continue; }
        if (res.status >= 500) { await sleep(5000); continue; }
        return null;
      }

      // Parse the JSON response
      const json = await res.json() as {
        data?: Array<{ url?: string; b64_json?: string }>;
      };

      const entry = json?.data?.[0];
      if (!entry) {
        console.warn(`[Pollinations] POST ${model}: empty data array`);
        continue;
      }

      // --- Handle URL response ---
      if (entry.url) {
        // The returned URL also requires auth — append ?key= if missing
        let imgUrl = entry.url;
        if (apiKey && !imgUrl.includes('key=')) {
          imgUrl += (imgUrl.includes('?') ? '&' : '?') + `key=${apiKey}`;
        }
        console.log(`[Pollinations] POST ${model}: got URL, fetching image...`);
        const imgBuf = await fetchImageFromUrl(imgUrl);
        if (imgBuf) return imgBuf;
        console.warn(`[Pollinations] POST ${model}: could not fetch image from URL`);
        continue;
      }

      // --- Handle b64_json response ---
      if (entry.b64_json) {
        const buf = Buffer.from(entry.b64_json, 'base64');
        if (buf.byteLength < 500) {
          console.warn(`[Pollinations] POST ${model}: b64 image too small`);
          continue;
        }
        console.log(`[Pollinations] ✅ POST ${model} success — ${buf.byteLength} bytes`);
        return { buffer: buf, contentType: detectType(buf) };
      }

      console.warn(`[Pollinations] POST ${model}: no url or b64_json in response`);
    } catch (err) {
      logError('POST', model, err);
      if (attempt < MAX_RETRIES - 1) await sleep(3000);
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Method 2: GET /image/{prompt}?key=... (direct binary image)
// Key MUST be passed as ?key= query param, NOT in Authorization header.
// ---------------------------------------------------------------------------

async function tryGet(
  options: GenerateImageOptions,
  model: string,
): Promise<GeneratedImage | null> {
  const { prompt, negativePrompt, width, height } = options;
  const w = clampSize(width);
  const h = clampSize(height);
  const seed = randomSeed();
  const apiKey = process.env.POLLINATIONS_API_KEY;

  // Truncate for URL safety
  const safePrompt = prompt.length > 1500 ? prompt.substring(0, 1500) : prompt;
  const encoded = encodeURIComponent(safePrompt);

  // Build URL — key goes as query param!
  let url = `https://gen.pollinations.ai/image/${encoded}?model=${model}&width=${w}&height=${h}&seed=${seed}&nologo=true`;
  if (negativePrompt) url += `&negative_prompt=${encodeURIComponent(negativePrompt)}`;
  if (apiKey) url += `&key=${apiKey}`;

  console.log(`[Pollinations] GET model="${model}" ${w}x${h} seed=${seed}`);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`[Pollinations] GET ${model} attempt ${attempt + 1}/${MAX_RETRIES}`);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const res = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[Pollinations] GET ${model} HTTP ${res.status}: ${errText.substring(0, 300)}`);
        if ([401, 402, 403].includes(res.status)) return null;
        if (res.status === 429) { await sleep(10000); continue; }
        if (res.status >= 500) { await sleep(5000); continue; }
        return null;
      }

      // Check content type — must be image, not JSON error
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json') || ct.includes('text/')) {
        const text = await res.text();
        console.warn(`[Pollinations] GET ${model}: got ${ct} instead of image: ${text.substring(0, 300)}`);
        continue;
      }

      const arrayBuf = await res.arrayBuffer();
      if (arrayBuf.byteLength < 500) {
        console.warn(`[Pollinations] GET ${model}: image too small (${arrayBuf.byteLength} bytes)`);
        continue;
      }

      const buf = Buffer.from(arrayBuf);
      const contentType = ct.includes('image/') ? ct : detectType(buf);

      console.log(`[Pollinations] ✅ GET ${model} success — ${buf.byteLength} bytes, ${contentType}`);
      return { buffer: buf, contentType };
    } catch (err) {
      logError('GET', model, err);
      if (attempt < MAX_RETRIES - 1) await sleep(3000);
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a single image using Pollinations.ai.
 *
 * Strategy:
 *   1. Try POST endpoint with each model (flux → zimage)
 *   2. Fallback to GET endpoint with each model
 */
export async function generateImage(
  options: GenerateImageOptions,
): Promise<GeneratedImage> {
  console.log(`[ImageGen] "${options.prompt.substring(0, 60)}..." (${options.width}×${options.height})`);
  const apiKey = process.env.POLLINATIONS_API_KEY;

  // GET endpoint is primary — proven reliable from production logs
  for (const model of POLLINATIONS_MODELS) {
    const result = await tryGet(options, model);
    if (result) return result;
  }

  // Fallback: POST endpoint (OpenAI-compatible)
  if (apiKey) {
    console.log('[ImageGen] GET failed, trying POST endpoint...');
    for (const model of POLLINATIONS_MODELS) {
      const result = await tryPost(options, model);
      if (result) return result;
    }
  }

  throw new Error(
    'Image generation failed.\n\n' +
    'Possible causes:\n' +
    '  • Pollen credits depleted (refills hourly)\n' +
    '  • API key may be invalid\n' +
    '  • Pollinations.ai may be down\n\n' +
    'Solutions:\n' +
    '  1. Wait a few minutes and try again\n' +
    '  2. Check your key at https://enter.pollinations.ai\n' +
    '  3. Set POLLINATIONS_API_KEY in your .env.local'
  );
}

/**
 * Generate multiple image variants.
 */
export async function generateMultipleImages(
  baseOptions: GenerateImageOptions,
  count: number,
  variantPrompts?: string[],
  variantNegatives?: string[],
): Promise<GeneratedImage[]> {
  const results: GeneratedImage[] = [];
  const errors: string[] = [];

  for (let i = 0; i < count; i++) {
    const prompt = variantPrompts?.[i] || baseOptions.prompt;
    const negativePrompt = variantNegatives?.[i] || baseOptions.negativePrompt;

    try {
      console.log(`[Pipeline] Generating variant ${i + 1}/${count}...`);
      const image = await generateImage({ ...baseOptions, prompt, negativePrompt });
      results.push(image);
      if (i < count - 1) await sleep(2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`Variant ${i + 1}: ${msg}`);
      console.error(`[Pipeline] Variant ${i + 1} failed:`, msg);
    }
  }

  if (results.length === 0) {
    throw new Error(`Failed to generate any variants.\n${errors.join('\n')}`);
  }

  console.log(`[Pipeline] Generated ${results.length}/${count} variants`);
  return results;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fetch an image from a URL and return as GeneratedImage */
async function fetchImageFromUrl(imageUrl: string): Promise<GeneratedImage | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);

    const res = await fetch(imageUrl, { signal: controller.signal, redirect: 'follow' });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[Fetch] Image URL returned ${res.status}`);
      return null;
    }

    const ct = res.headers.get('content-type') || '';

    // If the URL returns JSON or text, it's not an image
    if (ct.includes('json') || ct.includes('text/html')) {
      const txt = await res.text();
      console.warn(`[Fetch] URL returned ${ct}: ${txt.substring(0, 200)}`);
      return null;
    }

    const ab = await res.arrayBuffer();
    if (ab.byteLength < 500) {
      console.warn(`[Fetch] Image too small: ${ab.byteLength} bytes`);
      return null;
    }

    const buf = Buffer.from(ab);
    const contentType = ct.includes('image/') ? ct : detectType(buf);
    console.log(`[Fetch] ✅ Got image — ${buf.byteLength} bytes, ${contentType}`);
    return { buffer: buf, contentType };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Fetch] Failed: ${msg}`);
    return null;
  }
}

function clampSize(size: number): number {
  return Math.min(Math.max(Math.round(size / 8) * 8, 256), 1024);
}

function randomSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}

function detectType(buf: Buffer): string {
  if (buf[0] === 0xFF && buf[1] === 0xD8) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'image/png';
  if (buf[0] === 0x52 && buf[1] === 0x49) return 'image/webp';
  return 'image/png';
}

function logError(method: string, model: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('abort')) {
    console.warn(`[Pollinations] ${method} ${model}: Timeout`);
  } else {
    console.warn(`[Pollinations] ${method} ${model}: ${msg}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
