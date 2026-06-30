# TAPP — Security Review

**Date:** 2026-06-30
**Scope:** Client-side React + Vite app (Clerk auth, Finnhub live data, Vercel hosting). No backend yet; trades are simulated only ("we recommend, we never execute"). No real money movement.
**Method:** Static review of source. No code was modified. `npm audit` was not run in this environment (see Finding 6).

---

## Summary of findings

| # | Finding | Severity |
|---|---------|----------|
| 1 | Finnhub API key compiled into client bundle and sent in WebSocket/REST URLs | **High** |
| 2 | No HTTP security headers (no CSP, HSTS, X-Frame-Options, etc.) | **Medium** |
| 3 | SPA rewrite + missing `frame-ancestors` allows clickjacking of auth/order UI | **Medium** |
| 4 | Mock-login fallback grants full app access with no real authentication | **Medium** |
| 5 | Order/trade form numeric parsing — minor unsafe-input edges | **Low** |
| 6 | Dependency hygiene: `npm audit` not run; pinned major versions to confirm | **Low** |
| 7 | Forward-looking data-privacy guidance for Phase 3 (Supabase/Stripe) | **Low (advisory)** |

---

## 1. Finnhub API key exposed in the client bundle — **High**

**Where:** `src/live.jsx`
- Line 109 (REST): `fetch(\`https://finnhub.io/api/v1/quote?symbol=...&token=${encodeURIComponent(key)}\`)`
- Line 128 (WebSocket): `new WebSocket(\`wss://ws.finnhub.io?token=${encodeURIComponent(key)}\`)`
- Lines 162–165: auto-connect reads the key from `import.meta.env.VITE_FINNHUB_KEY`.

**Risk.** Anything prefixed `VITE_` is inlined into the JavaScript that Vite ships to the browser, so `VITE_FINNHUB_KEY` becomes a static string in `dist/assets/*.js`. On top of that, the key is placed directly in the WebSocket URL and the `/quote` query string, where it is also trivially visible in the browser DevTools Network tab to any visitor. There is no way to hide a `VITE_*` value from the client — extracting it is a copy-paste, not an attack.

The comment at `src/live.jsx:11` ("The key lives only in React state. It is never logged or persisted") is misleading: that is true of the *manually entered* key from the `LiveBar` input, but the *env-injected* key (lines 162–165) is baked into the bundle regardless.

Concrete consequences:
- **Quota / rate-limit theft.** The free tier is 60 req/min and 1 socket per key (noted at `src/live.jsx:8`). A third party who lifts the key can exhaust that quota, getting TAPP's own live feed throttled or erroring for real users.
- **Billing abuse** if the key is ever upgraded to a paid Finnhub plan — someone else's usage runs up the bill.
- **Account-level actions** scoped to that key (depending on Finnhub plan features) become available to whoever holds it.

**Remediation (recommended):**
1. Add a Vercel Serverless Function (e.g. `api/finnhub/quote.js`) that holds the key in a **non-`VITE_`** server env var (`FINNHUB_KEY`) and proxies the `/quote` REST call. The client calls `/api/finnhub/quote?symbol=NVDA`; the function appends the token server-side and returns JSON. This keeps the REST key entirely off the client.
2. The WebSocket (line 128) is the harder case — `wss://ws.finnhub.io?token=...` needs the token in the URL and browsers cannot proxy a raw WS handshake through a Vercel function cleanly. Options, in order of preference:
   - Stand up a small token-broker + WS relay (Vercel doesn't host long-lived sockets well; consider a tiny dedicated service / edge worker that relays Finnhub ticks to the client). This fully hides the key.
   - If a relay is out of scope short-term, mint a **separate, low-quota, free-tier-only** Finnhub key dedicated to the browser socket, accept that it is public, and add server-side monitoring/alerting on its usage. Keep the higher-value/paid key exclusively behind the REST proxy.
3. Rotate the current key after the proxy lands, since it has already shipped in the bundle and must be treated as compromised.
4. Update the misleading comment at `src/live.jsx:11`.

**Note on Clerk:** `VITE_CLERK_PUBLISHABLE_KEY` (`src/App.jsx:19–21`, passed to `<ClerkProvider publishableKey={...}>` at line 154) is **public by design** — Clerk publishable keys are meant to ship in the client and are not a secret. No action needed. The corresponding Clerk *secret* key must never be given a `VITE_` prefix when the backend lands (see Finding 7).

---

## 2. No HTTP security headers — **Medium**

**Where:** `vercel.json` — the config sets `framework`, `buildCommand`, `outputDirectory`, and a SPA `rewrites` rule, but **no `headers` block**. `index.html` likewise sets no CSP `<meta>` tag.

**Risk.** Without a Content-Security-Policy the app has no defense-in-depth against injected scripts (XSS), no protection against MIME-sniffing, no clickjacking protection, and connections are not pinned to HTTPS via HSTS. For an auth + (simulated) order-entry UI this is a meaningful gap.

**Remediation.** Add a `headers` block to `vercel.json`. The CSP below is scoped for a Vite + Clerk + Finnhub + TradingView app. **Validate it against the running app** (open DevTools console, watch for CSP violations) and tighten/loosen `connect-src`/`script-src`/`frame-src` to match exactly what Clerk and TradingView load — Clerk in particular uses a per-instance `*.clerk.accounts.dev` (or your custom Clerk domain) plus `*.clerk.com`, and TradingView widgets load from `s3.tradingview.com` / `*.tradingview.com`.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.com https://s3.tradingview.com https://*.tradingview.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://finnhub.io https://*.finnhub.io wss://ws.finnhub.io https://*.clerk.accounts.dev https://*.clerk.com https://*.tradingview.com; frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://*.tradingview.com https://s.tradingview.com; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests"
        },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=()" }
      ]
    }
  ]
}
```

Notes on the policy:
- `'unsafe-inline'` is included in `script-src` because Clerk and TradingView inject inline scripts; this weakens XSS protection. As a hardening follow-up, move to a nonce/hash-based CSP once you confirm what each vendor needs.
- `connect-src` explicitly allows `wss://ws.finnhub.io` and `https://finnhub.io` to keep the live feed working; once Finding 1's proxy lands, you can drop the direct Finnhub origins and allow only `'self'` (plus a relay origin).
- `payment=()` in Permissions-Policy can be relaxed later if Stripe's Payment Request API is used in Phase 3.
- `X-Frame-Options: DENY` and `frame-ancestors 'none'` are belt-and-suspenders for clickjacking (see Finding 3). If you ever need to embed TAPP in your own marketing site, switch both to allow that specific origin.

---

## 3. Clickjacking exposure of auth / order UI — **Medium**

**Where:** absence of `frame-ancestors` / `X-Frame-Options` (covered structurally by Finding 2), combined with the order-ticket and confirm flows in `src/components/ticker.jsx` (`OrderTicket`, lines 151–234) and `src/components/copilot.jsx` (`TradeScreen` confirm at lines 289–296).

**Risk.** With no frame-busting headers, a malicious page could iframe TAPP and overlay invisible UI to trick a logged-in user into clicking "Place buy order" / "Confirm Order" or interacting with the Clerk sign-in. Today the trades are simulated so the blast radius is low, but the same UI is the seam where real execution and account actions will eventually live.

**Remediation.** The headers in Finding 2 (`X-Frame-Options: DENY` + `frame-ancestors 'none'`) fully address this. No code change needed.

---

## 4. Mock-login fallback grants full access — **Medium**

**Where:**
- `src/App.jsx:152–158` — when `CLERK_KEY` is empty the app renders `<MockGate />` instead of Clerk.
- `src/App.jsx:133–137` — `MockGate` enters the app on any `onAuth` call with no verification.
- `src/components/auth.jsx:16` — `submit()` calls `onAuth(...)` after only client-side format checks (`emailOk`, `pw.length >= 6`).
- `src/components/auth.jsx:54` — the **"Skip for demo →"** button calls `onAuth({...})` unconditionally, bypassing even the form.

**Risk.** If TAPP is ever deployed to production **without** `VITE_CLERK_PUBLISHABLE_KEY` set in Vercel's env, the app silently falls back to `MockGate`, which authenticates nobody — anyone can enter via "Skip for demo" or by typing any email and a 6-char password. There is no server-side check; the gate is purely cosmetic. This is acceptable for local/preview but dangerous if it reaches a public production deploy by misconfiguration.

**Remediation:**
1. In production builds, fail closed: if `import.meta.env.PROD` is true and `CLERK_KEY` is empty, render an error/maintenance screen instead of `MockGate`. (Logic change in `src/App.jsx`; flagged here, not applied.)
2. Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set in the Vercel Production environment and add it to deployment checks.
3. Remove or gate the "Skip for demo" button (`src/components/auth.jsx:54`) behind a dev-only condition before any real launch.
4. Remember that even with Clerk, this is client-side gating only — once a backend exists, every protected API route must independently verify the Clerk session token server-side (see Finding 7).

---

## 5. Order/trade form numeric parsing — **Low**

**Where:** `src/components/ticker.jsx` `OrderTicket` (lines 170–173) and `src/components/copilot.jsx` `TradeScreen` (lines 202–204).

**What's already good.** Both forms use `Number(qty) || 0` and `Math.max(0, ...)` so negatives and `NaN` collapse to 0, and `valid`/`est` gate the submit button. Inputs are `type="number" min="0"`. Because orders are simulated and never leave the client, the security impact is minimal.

**Edge cases / weaknesses:**
- **Fractional/precision:** `Number(qty)` accepts fractional and very large values (e.g. `0.0001`, `1e9`). `est = q * price` can produce misleading huge or sub-cent figures; there's no max-quantity or integer-share guard.
- **Limit/stop sign checks are inconsistent.** In `OrderTicket`, `valid` (line 173) requires `Number(limit) > 0` for limit orders — good. In `TradeScreen`, **Stop Loss** and **Take Profit** (`src/components/copilot.jsx:266, 270`) are collected but never validated (`stop`/`tp` are not part of any `valid` check); a blank, zero, or nonsensical stop (e.g. stop above entry on a buy) passes straight to the "review/placed" confirmation. The limit price falls back to `price` via `Number(limit) || price` (line 203), so an invalid limit silently becomes a market-like price without warning.
- **Locale parsing:** `Number("1,000")` returns `NaN` → 0; users typing a thousands separator get a silent 0 rather than a validation message.

**Remediation (low priority, correctness > security here):**
- Add explicit validation for `stop`/`tp` in `TradeScreen` and surface inline errors (e.g. stop must be > 0 and on the correct side of entry; TP on the correct side).
- Clamp quantity to a sane max and decide integer vs fractional explicitly.
- Show a validation message rather than silently coercing bad input to 0 / to `price`.
- This becomes **High** the moment any of these values are sent to a real execution backend — re-validate everything server-side at that point. Never trust client-side numeric checks for real orders.

---

## 6. Dependency hygiene — **Low**

**Where:** `package.json`.

```
@clerk/react      ^6.7.3
lucide-react      ^0.383.0
react             ^18.3.1
react-dom         ^18.3.1
@vitejs/plugin-react ^4.3.1   (dev)
vite              ^5.3.1      (dev)
```

**Observations:**
- **`npm audit` was not run here** (no reliable lockfile/network execution in this review environment). **Recommendation:** run `npm audit` (and `npm audit fix` for non-breaking advisories) locally/in CI, and add it to the Vercel/CI pipeline so new advisories surface on every install. Consider Dependabot/Renovate for automated PRs.
- **Caret ranges (`^`)** mean each fresh `npm install` can pull newer minors/patches. Confirm a committed `package-lock.json` exists so production builds are reproducible (it was not part of this review set — verify it's present and committed).
- **Clerk `@clerk/react ^6.7.3`** — Clerk iterates quickly and ships security fixes; pin/track and update deliberately. Verify `@clerk/react` is the intended package name for your Clerk SDK version (Clerk has historically shipped `@clerk/clerk-react`); a wrong/[]typo'd package name is a supply-chain risk worth double-checking.
- **React `^18.3.1` / Vite `^5.3.1`** — current and well-supported as of this review; no known critical issues, but include them in the regular `npm audit`/update cadence.
- No other third-party network/script dependencies are loaded at runtime beyond Clerk, Finnhub, and (per project description) TradingView — keep that surface small.

---

## 7. Data-privacy basics for Phase 3 (Supabase / Stripe) — **Low (advisory, forward-looking)**

When the backend lands, carry these forward:
- **Never put secret keys in `VITE_*`.** Supabase `service_role` key, Stripe **secret** key, Clerk **secret** key, and the Finnhub key (Finding 1) must live only in server-side env vars (Vercel Functions / edge). Only publishable/anon keys may be client-side, and only where the vendor intends it.
- **Supabase Row-Level Security (RLS):** enable RLS on every table from day one; the anon key is public, so RLS is the actual access control. Don't rely on the client to scope queries.
- **Verify webhooks.** Validate Stripe webhook signatures (`stripe.webhooks.constructEvent` with the signing secret) and Clerk webhook signatures (Svix headers) on every inbound webhook; reject unsigned/invalid payloads. Treat webhook endpoints as unauthenticated public routes that must self-verify.
- **Server-side session verification.** Every protected API route must verify the Clerk session token server-side (see Finding 4); client-side gating is UX, not security.
- **PII / financial data minimization.** Store only what's needed; encrypt at rest (Supabase default) and in transit (HTTPS/HSTS already covered in Finding 2). Be deliberate about logging — never log keys, tokens, full emails, or order details in plaintext.
- **Stripe PCI scope:** use Stripe Checkout / Elements so card data never touches your servers, keeping PCI scope minimal.

---

## Recommended order of remediation
1. **Finding 1** (High) — proxy/rotate the Finnhub key.
2. **Findings 2 & 3** (Medium) — add the `headers` block to `vercel.json` (single change, covers both).
3. **Finding 4** (Medium) — fail-closed in production + confirm Clerk env var is set.
4. **Findings 5–7** (Low / advisory) — tighten form validation; wire `npm audit` into CI; apply the Phase 3 data-privacy checklist when the backend is built.
