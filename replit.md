# FrameMint — Replit Setup

## Overview
FrameMint is a Next.js 16 app (React 19, TypeScript, Tailwind CSS v4) originally built for Vercel, now running on Replit. It's an AI-powered thumbnail generator for YouTube creators.

## Running the App
- **Dev server**: `npm run dev` — starts on port 5000, bound to 0.0.0.0 (required for Replit preview)
- **Production build**: `npm run build` then `npm run start`
- **Build with rclone**: `npm run build:full` (downloads rclone binary before building)

## Architecture
- **Framework**: Next.js 16 with App Router (`src/app/`)
- **Auth/DB**: Supabase (SSR client via `@supabase/ssr`)
- **Payments**: Cashfree
- **AI**: Groq (prompt enhancement) + HuggingFace (image generation)
- **Storage**: rclone (cloud storage sync — binary downloaded separately via `scripts/install-rclone.sh`)
- **Styling**: Tailwind CSS v4, shadcn/ui, framer-motion

## Design System
Premium AI SaaS aesthetic. Key tokens (defined in `src/app/globals.css`):
- **Background**: `#02000E` (ultra-dark deep navy)
- **Primary**: `#7C3AED` violet, light `#A78BFA`
- **Surface layers**: `--fm-surface`, `--fm-surface-2`, `--fm-surface-3`
- **Full-page bg**: Fixed `radial-gradient` via inline style on root div — covers entire page, fixes the old "purple ellipse box" bug
- **Utility classes**: `.glass`, `.glass-card`, `.glass-card-static`, `.glass-hover`, `.gradient-border`, `.gradient-primary`, `.gradient-primary-text`, `.gradient-hero-text`, `.btn-primary`, `.btn-secondary`, `.btn-glass`, `.badge-pill`, `.stat-number`, `.feature-card`, `.glass-input`, `.glass-navbar`, `.glass-sidebar`, `.page-bg`, `.noise-overlay`, `.section-divider`, `.bg-dot-grid`, `.bg-grid-lines`

## Key Pages
- `src/app/(marketing)/page.tsx` — Landing page (hero, stats, features, pricing, FAQ, CTA)
- `src/app/(auth)/login/page.tsx` — Login/signup (split panel layout)
- `src/app/(dashboard)/dashboard/page.tsx` — Dashboard home (stats, recent thumbnails)
- `src/app/(dashboard)/create/page.tsx` — 3-step thumbnail generation flow
- `src/app/(dashboard)/gallery/page.tsx` — Thumbnail gallery with search/filter
- `src/app/(dashboard)/settings/page.tsx` — Profile settings
- `src/app/(dashboard)/settings/billing/page.tsx` — Billing & credits

## Key Components
- `src/components/layout/Sidebar.tsx` — Collapsible sidebar with section labels and upgrade CTA
- `src/components/layout/Navbar.tsx` — Top bar with credits display and user menu
- `src/components/layout/Footer.tsx` — Marketing footer
- `src/components/billing/PricingCards.tsx` — Pricing plan cards with Cashfree checkout
- `src/components/billing/CreditMeter.tsx` — Credit usage progress bar

## Key Directories
- `src/app/` — Next.js App Router pages (auth, dashboard, marketing, api routes)
- `src/components/` — Shared UI components
- `src/hooks/` — Custom hooks (useUser, useCredits, useGeneration, useGallery)
- `src/lib/` — Utilities and Supabase clients
- `src/types/` — TypeScript types
- `src/proxy.ts` — Supabase session proxy (Next.js 16 convention, replaces middleware.ts)
- `scripts/` — Build helper scripts (rclone installer)
- `supabase/` — Supabase configuration/migrations

## Environment Variables Required
See `.env.example` or request from project owner:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `HUGGINGFACE_API_KEY`
- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`
- `NEXT_PUBLIC_CASHFREE_ENV` (sandbox | production)

## Replit Configuration
- `next.config.ts` has `allowedDevOrigins` set to `*.replit.dev` and `*.repl.co` for the preview iframe
- All required secrets are stored in Replit Secrets (not .env files)
- `NEXT_PUBLIC_CASHFREE_ENV` is set to `sandbox` — change to `production` when going live

## Notes
- Vercel cron jobs (`vercel.json`) do not run on Replit — manual execution required
- Google Drive storage (rclone) requires `RCLONE_CONFIG_BASE64` secret to be set separately
- App works as a frontend-only preview without all env vars configured
