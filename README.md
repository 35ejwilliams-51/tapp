# TAPP Founder Prototype — Unified M0

Version: `0.0.3-m0-unified`

This codebase merges the earlier React/Vite TAPP trading UI with the Founder-approved M0 platform foundation.

## What was preserved
- Responsive React/Vite interface and TAPP design tokens
- Mobile/tablet/desktop/ultra-wide layouts
- Scanner, chart, alerts, profile, ticker detail, and simulated order-ticket UI
- Clerk client integration seam with mock fallback
- Simulated market-data behavior for development/degraded mode

## What changed
- Browser-side Finnhub key entry was removed
- Market data now flows `Browser -> TAPP API -> market provider adapter`
- `FINNHUB_API_KEY` is server-side only
- TAPP API exposes health, Founder context, and canonical market quote gateway endpoints
- Provider abstraction, trace IDs, build identity, environment templates, CI/tests, and M0 ADRs are retained from the new architecture
- Real-money order execution remains absent from Founder Prototype v0.1

## Local development

```bash
npm install
npm run dev:api
# separate terminal
npm run dev:web
```

Open `http://localhost:5173`. Vite proxies `/api/*` to `http://localhost:8787`.

## Configuration
Copy `.env.example` to `.env` for server-only configuration. Copy `apps/web/.env.example` to `apps/web/.env.local` only for public client configuration such as the Clerk publishable key.

Never place Finnhub, AI-provider, database, Clerk secret, or other private credentials in `VITE_*` variables.

## Current status
This is a unified local M0 scaffold. External provider credentials, managed database migration, real Founder Testing deployment, observability verification, and rollback exercise remain required before M0 can be marked complete.
