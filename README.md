# 🎨 FrameMint

AI-powered YouTube thumbnail generator — type a title, get stunning click-worthy thumbnails in seconds.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, Supabase (Auth + Postgres) |
| **AI** | Groq (prompt enhancement), HuggingFace (SDXL image gen) |
| **Editor** | Fabric.js canvas with text, shapes, and export |
| **Payments** | Cashfree (INR checkout + webhooks) |
| **Storage** | Google Drive via rclone |
| **CI/CD** | GitHub Actions → Vercel |

## Quick Start

```bash
# 1. Clone & install
git clone <repo-url> && cd framemint
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in your Supabase, Groq, HuggingFace, and Cashfree keys

# 3. Run database migrations
# Apply supabase/migrations/*.sql to your Supabase project

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, OAuth callback
│   ├── (dashboard)/     # Dashboard, create, editor, gallery, settings, A/B test
│   ├── (marketing)/     # Landing page, pricing
│   └── api/             # 14 API routes (generate, user, payments, cron, ab-test)
├── components/
│   ├── billing/         # PricingCards, CreditMeter, SubscriptionManager
│   ├── thumbnail/       # GeneratorForm, StylePicker, VariantGrid, ThumbnailCard
│   ├── ab-test/         # ABTestCreator, Dashboard, VariantComparison
│   ├── editor/          # ThumbnailEditor (Fabric.js canvas)
│   ├── layout/          # Navbar, Sidebar, Footer
│   └── ui/              # shadcn/ui primitives
├── lib/
│   ├── ai/              # Groq, HuggingFace, prompt builder, post-processing
│   ├── payments/        # Cashfree integration
│   ├── storage/         # Google Drive (rclone)
│   ├── video/           # yt-dlp, ffmpeg wrappers
│   └── supabase/        # Client, server, middleware
├── hooks/               # useUser, useCredits, useGeneration, useGallery, useABTest
└── types/               # TypeScript interfaces
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |

## License

Private — All rights reserved.
