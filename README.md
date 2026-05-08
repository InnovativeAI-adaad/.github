# Multi-Agent Orchestration Monorepo

This repository provides a starter monorepo for building a multi-agent orchestration platform with:

- `apps/web`: React + TypeScript + Vite frontend.
- `apps/edge-functions/orchestrate-agents`: Edge function endpoint with:
  - `POST` orchestration session creation
  - `GET` session search
- `packages/shared`: Shared types/interfaces for agents, consensus metrics, and session records.
- `packages/ui`: Reusable UI components (cards, charts, filters, panels).

## 1) Prerequisites

- Node.js 20+
- pnpm 9+
- (Optional) Supabase CLI for local edge-function workflows

## 2) Install dependencies

```bash
pnpm install
```

## 3) Configure environment variables

Copy the sample env file and fill in values:

```bash
cp .env.example .env
```

### Required environment variables

- `VITE_API_BASE_URL`: Web app API base URL.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_ANON_KEY`: Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: Service-role key for server-side operations.
- `DATABASE_URL`: PostgreSQL connection string.
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`: Model provider keys.

## 4) Run local development

### Run everything in parallel

```bash
pnpm dev
```

### Run only web UI

```bash
pnpm dev:web
```

### Run only edge function

```bash
pnpm dev:edge
```

## 5) Build and verify

```bash
pnpm build
pnpm typecheck
pnpm lint
```

## 6) Deploy guidance

### Web app (`apps/web`)

1. Build with `pnpm --filter @apps/web build`.
2. Deploy `apps/web/dist` to your static host (Vercel, Netlify, Cloudflare Pages, etc.).
3. Set `VITE_API_BASE_URL` in the hosting provider environment settings.

### Edge function (`apps/edge-functions/orchestrate-agents`)

1. Ensure your platform has `SUPABASE_*`, provider API keys, and `DATABASE_URL` configured.
2. Deploy with your platform workflow (e.g., Supabase functions deploy pipeline).
3. Verify:
   - `POST /orchestrate-agents` starts a session.
   - `GET /orchestrate-agents?q=<search-term>` returns filtered sessions.

## 7) Workspace layout

```text
apps/
  web/
  edge-functions/
    orchestrate-agents/
packages/
  shared/
  ui/
```

## 8) Next recommended steps

- Replace in-memory session storage with persistent DB reads/writes.
- Add auth and session ownership checks.
- Add charts/tables backed by real data.
- Add unit + integration tests for function handlers and UI components.
