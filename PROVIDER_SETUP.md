# TAPP M0 Provider Setup

## Vercel
Create/connect the Founder Testing project and use the repository root. The included `vercel.json` builds the React/Vite workspace into `dist/web` and exposes TAPP API functions under `/api`.

## Neon
Create the managed PostgreSQL database and set `DATABASE_URL` only in server-side environment configuration. Apply `infra/sql/001_m0_foundation.sql` after provisioning.

## Clerk
Create/connect the Clerk application. The web client may receive only the Clerk publishable key through `VITE_CLERK_PUBLISHABLE_KEY`. Server-side verification uses `CLERK_SECRET_KEY` and the approved authorized-party configuration.

## Finnhub / market data
Rotate any credential that existed in the old project before reuse. Store the new key as server-side `FINNHUB_API_KEY`. Do not create `VITE_FINNHUB_KEY` and do not paste a market-data key into the browser. The web application calls `/api/market/quotes`; the TAPP backend calls the provider.

## Observability
Use Vercel built-in runtime logs/observability for M0 plus TAPP trace IDs. Validate that `/api/health`, `/api/founder/context`, and `/api/market/quotes` requests can be traced in Founder Testing.

## M0 external completion sequence
1. Connect Vercel project.
2. Provision Neon and apply foundation SQL.
3. Configure Clerk client/server variables.
4. Rotate and configure Finnhub server key.
5. Deploy Founder Testing.
6. Verify live market gateway and visible data state.
7. Verify health/Founder diagnostics.
8. Perform deployment rollback exercise.
9. Record evidence in the M0 gate package.
