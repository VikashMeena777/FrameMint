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
      suggestedText: extractKeyPhrases(title),
      suggestedColors: ['#6C5CE7', '#00D2FF', '#1a1a2e'],
    };
  }

  const systemPrompt = `You are a world-class YouTube thumbnail designer who creates viral, click-worthy thumbnails. Your job is to create an image generation prompt that produces a RELEVANT, COMPELLING thumbnail for the given video title.

CRITICAL RULES:
1. The thumbnail must VISUALLY REPRESENT the video's topic, not just be a pretty background
2. Include specific visual subjects: people, objects, scenes, actions that relate to the title
3. Think "What would make someone CLICK this video?" — create that scene
4. DO NOT generate abstract backgrounds, generic tech imagery, or circuit boards unless specifically relevant
5. DO NOT include any text, words, or letters in the image — text will be overlaid separately
6. Make it dramatic, eye-catching, and emotionally compelling

EXAMPLES of good vs bad prompts:
- Title: "I Built a $100K AI SaaS in 1 Week"
  BAD: "A glowing circuit board with blue lights" (generic, boring)
  GOOD: "A confident young entrepreneur sitting at a modern desk with multiple screens showing SaaS dashboards and revenue graphs, dramatic golden lighting, piles of cash and a laptop, looking directly at camera with an amazed expression, cinematic split lighting, ultra detailed, 8k"

- Title: "How I Lost 30 Pounds in 90 Days"
  BAD: "A healthy salad on a white background" (generic)
  GOOD: "Split image of a before/after transformation, left side darker lighting showing struggle, right side bright lighting showing confidence, gym equipment in background, dramatic lighting, fitness motivation, cinematic quality"

Respond ONLY with valid JSON:
{
  "enhancedPrompt": "detailed specific image generation prompt...",
  "suggestedText": ["SHORT BOLD TEXT 1", "SHORT BOLD TEXT 2"],
  "suggestedColors": ["#hex1", "#hex2", "#hex3"]
}

For suggestedText: Create 2-3 SHORT, PUNCHY text overlays (max 4-5 words each) that would work on a thumbnail. Think clickbait: numbers, reactions, results.
For suggestedColors: Pick colors that are high-contrast, vibrant, and match the mood.`;

  const userMessage = `Title: "${title}"
Style: ${style} (${STYLE_DESCRIPTIONS[style]})
Platform: ${platform} (${PLATFORM_SIZES[platform].width}x${PLATFORM_SIZES[platform].height})

Create a thumbnail image prompt that:
- Shows SPECIFIC visual content related to "${title}"
- Has a dramatic, attention-grabbing composition
- Would make someone stop scrolling and click
- Uses the ${style} style aesthetic
- NO text/words/letters in the image`;

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
        temperature: 0.8,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status, await response.text());
      return {
        enhancedPrompt: buildFallbackPrompt(title, style, platform),
        suggestedText: extractKeyPhrases(title),
        suggestedColors: ['#6C5CE7', '#00D2FF', '#1a1a2e'],
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty Groq response');

    const parsed = JSON.parse(content) as EnhancePromptResult;
    return {
      enhancedPrompt: parsed.enhancedPrompt || buildFallbackPrompt(title, style, platform),
      suggestedText: parsed.suggestedText || extractKeyPhrases(title),
      suggestedColors: parsed.suggestedColors || ['#6C5CE7', '#00D2FF', '#1a1a2e'],
    };
  } catch (error) {
    console.error('Groq prompt enhancement failed:', error);
    return {
      enhancedPrompt: buildFallbackPrompt(title, style, platform),
      suggestedText: extractKeyPhrases(title),
      suggestedColors: ['#6C5CE7', '#00D2FF', '#1a1a2e'],
    };
  }
}

function buildFallbackPrompt(title: string, style: ThumbnailStyle, platform: Platform): string {
  const { width, height } = PLATFORM_SIZES[platform];
  const aspect = width > height ? 'landscape' : width === height ? 'square' : 'portrait';
  return `A dramatic, eye-catching ${aspect} thumbnail scene that visually represents "${title}". Show relevant objects, people, or scenes that connect to the topic. Style: ${STYLE_DESCRIPTIONS[style]}. Cinematic lighting, vivid colors, emotional composition, no text or letters. 8k quality, professional photography, YouTube thumbnail style, attention-grabbing.`;
}

/**
 * Extract the most impactful words/phrases from the title for suggested text overlays
 */
function extractKeyPhrases(title: string): string[] {
  const phrases: string[] = [];

  // Pull out numbers (e.g. "$100K", "1 Week", "30 Pounds")
  const numbers = title.match(/\$?[\d,]+[kKmMbB]?\s*\w*/g);
  if (numbers) {
    phrases.push(...numbers.map((n) => n.trim().toUpperCase()));
  }

  // Pull out short power phrases
  const words = title.split(/\s+/);
  if (words.length <= 5) {
    phrases.push(title.toUpperCase());
  } else {
    // Take first 4 words as a phrase
    phrases.push(words.slice(0, 4).join(' ').toUpperCase());
  }

  // Deduplicate and limit
  return [...new Set(phrases)].slice(0, 3);
}

export { PLATFORM_SIZES, STYLE_DESCRIPTIONS };
