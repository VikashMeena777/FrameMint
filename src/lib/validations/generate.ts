import { z } from 'zod';

export const thumbnailStyles = [
  'cinematic',
  'gaming',
  'vlog',
  'educational',
  'podcast',
  'minimal',
  'bold-text',
  'split-screen',
  'custom',
] as const;

export const platforms = [
  'youtube',
  'instagram',
  'twitter',
  'linkedin',
  'tiktok',
  'custom',
] as const;

export const generateThumbnailSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be under 200 characters'),
  style: z.enum(thumbnailStyles, {
    message: 'Invalid thumbnail style',
  }),
  platform: z.enum(platforms, {
    message: 'Invalid platform',
  }),
  variants: z
    .number()
    .int()
    .min(1)
    .max(4)
    .optional()
    .default(4),
});

export const enhancePromptSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be under 200 characters'),
  style: z.enum(thumbnailStyles).optional().default('cinematic'),
});

export type GenerateThumbnailInput = z.infer<typeof generateThumbnailSchema>;
export type EnhancePromptInput = z.infer<typeof enhancePromptSchema>;
