export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  credits_remaining: number;
  credits_total: number;
  created_at: string;
  updated_at: string;
}

export interface Thumbnail {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  style: ThumbnailStyle;
  platform: Platform;
  image_urls: string[];
  gdrive_path: string | null;
  is_favourite: boolean;
  credits_used: number;
  created_at: string;
}

export interface CreditBalance {
  remaining: number;
  total: number;
  used: number;
  percentage: number;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface ABTest {
  id: string;
  user_id: string;
  name: string;
  variants: ABTestVariant[];
  status: 'active' | 'completed' | 'draft';
  created_at: string;
}

export interface ABTestVariant {
  id: string;
  thumbnail_id: string;
  image_url: string;
  impressions: number;
  clicks: number;
  ctr: number;
  share_url: string;
}

export interface VideoExtraction {
  id: string;
  user_id: string;
  video_url: string;
  video_title: string;
  frames: string[];
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

export type ThumbnailStyle =
  | 'cinematic'
  | 'gaming'
  | 'vlog'
  | 'educational'
  | 'podcast'
  | 'minimal'
  | 'bold-text'
  | 'split-screen'
  | 'custom';

export type Platform =
  | 'youtube'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'custom';

export interface PlanDetails {
  name: string;
  slug: 'free' | 'pro' | 'enterprise';
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

export const PLANS: PlanDetails[] = [
  {
    name: 'Free',
    slug: 'free',
    price: 0,
    credits: 5,
    features: [
      '5 thumbnails/month',
      'Basic styles',
      'Standard resolution',
      '30-day storage',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    slug: 'pro',
    price: 499,
    credits: 100,
    popular: true,
    features: [
      '100 thumbnails/month',
      'All styles + custom',
      '4K resolution',
      'Background removal',
      'A/B testing',
      'Video-to-thumbnail',
      '1-year storage',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    price: 1499,
    credits: 500,
    features: [
      '500 thumbnails/month',
      'API access',
      'Custom branding',
      'Bulk generation',
      'Permanent storage',
      'Team collaboration',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
];

export interface GenerationVariant {
  id: string;
  imageUrl: string;
  seed?: number;
}

export interface GenerationResult {
  thumbnailId: string;
  variants: GenerationVariant[];
  enhancedPrompt?: string;
  suggestedText: string[];
  creditsUsed: number;
  creditsRemaining: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
