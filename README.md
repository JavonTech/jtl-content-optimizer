# JTL Content Optimizer

AI-powered social media content optimizer for **Javon Technology Ltd.**
Generates platform-specific posts using Claude, tracks engagement, and surfaces optimization insights.

---

## Features

| Page | What it does |
|------|-------------|
| `/create` | Generate posts via Claude with platform, content type, topic, CTA goal. Saves draft to Supabase. |
| `/log` | Select a saved post and record engagement metrics + Kajabi revenue. |
| `/dashboard` | Full post table with summary cards. Top 3 performers badged by engagement rate. |
| `/insights` | One-click AI analysis of all posts — Claude returns narrative optimization recommendations. |

---

## Local Development

### 1. Clone & install

```bash
git clone <your-repo>
cd "Cloud AI Project"
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key |

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Verify the `posts` table appears in **Table Editor**

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/create`.

---

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** → select your repo
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy** (it will fail first run — add env vars next)

### Step 3: Add environment variables

In Vercel → Project → **Settings → Environment Variables**, add:

```
ANTHROPIC_API_KEY          = sk-ant-...
NEXT_PUBLIC_SUPABASE_URL   = https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY  = eyJ...
```

Set all four for **Production**, **Preview**, and **Development**.

### Step 4: Redeploy

Go to **Deployments** → click the three-dot menu on the latest deploy → **Redeploy**.

Your app is live at `https://your-project.vercel.app`.

---

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **@anthropic-ai/sdk** — Claude claude-opus-4-6 for generation & insights
- **@supabase/supabase-js** — Postgres database
- Pure CSS dark theme (no external UI libraries)

---

## Database Schema

```sql
posts (
  id             uuid  primary key
  created_at     timestamptz
  platform       text          -- LinkedIn | Instagram | X | Facebook
  content_type   text
  topic          text
  cta_goal       text
  generated_text text
  posted_at      date
  likes          integer
  comments       integer
  shares         integer
  clicks         integer
  impressions    integer
  kajabi_revenue numeric(10,2)
)
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/generate` | Generate post with Claude, inject top performers as context, save to Supabase |
| `PATCH` | `/api/log-post` | Update engagement metrics and revenue for a post |
| `GET` | `/api/posts` | Return all posts with computed `engagement_total` and `engagement_rate` |
| `GET` | `/api/insights` | Fetch all posts, send to Claude, return narrative optimization analysis |
