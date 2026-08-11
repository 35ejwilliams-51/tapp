# Legacy TAPP Integration Notes

The uploaded legacy application was not discarded. Its React/Vite UI, design tokens, responsive layouts, market-facing screens, Clerk client seam, simulated fallback, ticker detail, and simulated order-ticket interfaces were adopted as the frontend foundation.

The old direct-browser market-data architecture was intentionally replaced. The browser no longer receives a Finnhub secret and no longer offers a field for users to paste one. Market data is requested through the TAPP API gateway, where provider credentials, normalization, freshness, quarantine, entitlement, and future provider-switch logic belong.

The order ticket remains simulation-only. No brokerage/execution API is connected in Founder Prototype v0.1.

Any credentials found in the uploaded legacy `.env` were not copied into this unified project and should be rotated before reuse.
