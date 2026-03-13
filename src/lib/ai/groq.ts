import type { ThumbnailStyle, Platform } from '@/types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface EnhancePromptResult {
  enhancedPrompt: string;
  suggestedText: string[];
  suggestedColors: string[];
}

const STYLE_DESCRIPTIONS: Record<ThumbnailStyle, string> = {
  cinematic: 'dramatic lighting, film grain, widescreen composition, epic atmosphere',
  gaming: 'neon colors, dynamic action, glowing effects, energetic composition',
  vlog: 'warm tones, personal feel, lifestyle aesthetic, natural lighting',
  educational: 'clean layout, informative design, professional look, clear typography space',
  podcast: 'microphone imagery, warm studio lighting, conversational mood',
  minimal: 'clean whitespace, simple geometry, monochrome palette, sophisticated',
  'bold-text': 'large bold typography focus, high contrast, impactful text layout',
  'split-screen': 'divided composition, before/after or comparison layout, dual subjects',
  custom: 'creative and unique composition',
};

const PLATFORM_SIZES: Record<Platform, { width: number; height: number }> = {
  youtube: { width: 1280, height: 720 },
  instagram: { width: 1080, height: 1080 },
  twitter: { width: 1200, height: 675 },
  linkedin: { width: 1200, height: 627 },
  tiktok: { width: 1080, height: 1920 },
  custom: { width: 1280, height: 720 },
};

export async function enhancePrompt(
  title: string,
  style: ThumbnailStyle,
  platform: Platform
): Promise<EnhancePromptResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // Fallback: return a decent prompt without Groq
    return {
      enhancedPrompt: buildFallbackPrompt(title, style, platform),
      suggestedText: [title.toUpperCase()],
      suggestedColors: ['#6C5CE7', '#00D2FF', '#1a1a2e'],
    };
  }

  const systemPrompt = `You are an expert thumbnail designer for social media. Given a video title, style, and platform, generate:
1. An optimized image generation prompt (for Stable Diffusion / FLUX) that would create a stunning thumbnail
2. 2-3 suggested text overlay options
3. 3 suggested hex color codes that match the style

Respond ONLY with valid JSON in this exact format:
{
  "enhancedPrompt": "detailed prompt for image generation...",
  "suggestedText": ["TEXT OPTION 1", "TEXT OPTION 2"],
  "suggestedColors": ["#hex1", "#hex2", "#hex3"]
}`;

  const userMessage = `Title: "${title}"
Style: ${style} (${STYLE_DESCRIPTIONS[style]})
Platform: ${platform} (${PLATFORM_SIZES[platform].width}x${PLATFORM_SIZES[platform].height})

Create a thumbnail generation prompt. Make it vivid, specific, and optimized for AI image generation. Do NOT include any text/words/letters in the image prompt — text will be overlaid separately.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status, await response.text());
      return {
        enhancedPrompt: buildFallbackPrompt(title, style, platform),
        suggestedText: [title.toUpperCase()],
        suggestedColors: ['#6C5CE7', '#00D2FF', '#1a1a2e'],
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty Groq response');

    const parsed = JSON.parse(content) as EnhancePromptResult;
    return {
      enhancedPrompt: parsed.enhancedPrompt || buildFallbackPrompt(title, style, platform),
      suggestedText: parsed.suggestedText || [title.toUpperCase()],
      suggestedColors: parsed.suggestedColors || ['#6C5CE7', '#00D2FF', '#1a1a2e'],
    };
  } catch (error) {
    console.error('Groq prompt enhancement failed:', error);
    return {
      enhancedPrompt: buildFallbackPrompt(title, style, platform),
      suggestedText: [title.toUpperCase()],
      suggestedColors: ['#6C5CE7', '#00D2FF', '#1a1a2e'],
    };
  }
}

function buildFallbackPrompt(title: string, style: ThumbnailStyle, platform: Platform): string {
  const { width, height } = PLATFORM_SIZES[platform];
  const aspect = width > height ? 'landscape' : width === height ? 'square' : 'portrait';
  return `Professional ${aspect} thumbnail for "${title}". Style: ${STYLE_DESCRIPTIONS[style]}. High quality, vibrant colors, eye-catching composition, no text or letters in the image. 8k quality, professional photography, trending on social media.`;
}

export { PLATFORM_SIZES, STYLE_DESCRIPTIONS };
