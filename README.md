# Lanka Market Prices

Sri Lanka CBSL daily commodity price tracker — built with **Next.js 16** (App Router).

## Architecture

This is a **single unified Next.js project**. The Express backend has been replaced by Next.js API Routes (serverless functions). No separate server needed.

```
Frontend (React/Tailwind)  →  /api/*  →  API Routes (pg → Supabase)
```

All on the same origin — no CORS, no extra deployment.

## Folder Structure

```
src/
├── lib/
│   ├── db.ts          # Singleton pg Pool (serverless-safe)
│   ├── api.ts         # Client-side fetch helpers
│   └── constants.ts   # VALID_MARKETS (shared by API + UI)
├── types/
│   └── index.ts       # Shared TypeScript types
└── app/
    ├── api/           # Serverless API routes (replaces Express)
    │   ├── health/
    │   ├── items/
    │   │   └── categories/
    │   └── prices/
    │       └── summary/
    ├── components/    # UI components
    ├── item/[name]/   # Dynamic item detail page
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Fill in your Supabase DB credentials
   ```

   `.env.local`:
   ```
   DB_HOST=db.xxxx.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_password
   NODE_ENV=development
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Deploy to Vercel**
   ```bash
   vercel deploy
   ```
   Add the same `DB_*` env vars in the Vercel dashboard. API Routes deploy automatically as serverless functions.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness check |
| GET | `/api/items` | All items (item, category, unit) |
| GET | `/api/items/categories` | Unique category list |
| GET | `/api/prices?item=Tomato&groupBy=day` | Price history |
| GET | `/api/prices/summary?category=Vegetables` | Latest prices + 30d avg |

## Why Serverless API Routes?

- **No separate server** to manage, deploy, or scale
- **Auto-scaling** — Vercel spins up functions per request
- **Same origin** — fetch(`/api/prices`) just works, no CORS config
- **TypeScript end-to-end** — shared types between API and UI
- **One deployment** — `vercel deploy` ships everything
