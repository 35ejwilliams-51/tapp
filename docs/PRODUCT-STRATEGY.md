# TAPP — Product Strategy & Phase Plan (v1)

*Phase 1 deliverable. Locked decisions: evolve the current React/Vite app · embed
TradingView for charts · lean (free/low-cost) data budget · start with strategy +
design. Stocks + crypto first; futures deferred.*

---

## 1. The product in one paragraph
TAPP is a subscription web app that scans markets and surfaces high-probability
trade setups using ICT/SMC analysis, then hands each trader a clean, ready-to-execute
plan — entry, stop, targets, risk/reward, and a confidence score — to place on their
**own** broker. TAPP analyzes and recommends; it never executes a trade. Think *"an AI
trading-desk analyst,"* not a brokerage.

## 2. Who it's for
- **Primary:** retail traders (beginner → intermediate) who already have a brokerage
  (Robinhood, Webull, ThinkorSwim, Coinbase, etc.) and want clearer, higher-conviction
  setups without learning to read raw charts.
- **Secondary:** experienced traders who want a fast scanner + a structured second opinion.
- Global, English-first.

**Personas (quick):**
1. *"Learning Leo"* — 6 months in, loses on impulse trades, wants guardrails + education.
2. *"Busy Bianca"* — trades part-time, wants a daily shortlist of clean setups.
3. *"Pro Priya"* — experienced, wants to scan any ticker fast and validate her bias.

## 3. Value proposition
- **Clarity** — pro-grade charts + plain-English setups (FVG, BOS/MSS, order block) shown by a click.
- **Conviction** — an AI probability score + a complete trade plan, not just a tip.
- **Speed** — scan any ticker, get a read in seconds.
- **Safety** — education + disclaimers; you execute on the platform you already use.

**Positioning line (draft):** *"Your AI trading desk — cleaner charts, higher-conviction setups, zero noise."*

## 4. Business model
Subscription. Because TAPP never executes trades, regulatory load is lighter than a
broker's — but publishing setups is still *signals*, so disclaimers + terms are required
(see §11). Proposed tiers (pricing finalized after a competitor/CRO pass):

| Tier  | Price (draft) | Includes |
| ----- | ------------- | -------- |
| Free  | $0            | Limited scanner, delayed data, 1 watchlist |
| Pro   | ~$29/mo       | Full scanner, real-time-ish stocks + crypto, all timeframes, unlimited watchlists, trade plans |
| Elite | ~$79/mo       | Alerts, priority signals, futures (when added), advanced backtests |

## 5. Sitemap / information architecture
**Marketing (public, SEO-facing):** Home · Features · Pricing · About · Education/Blog · Legal (Terms, Privacy, Risk Disclosure).
**App (auth-gated):** Dashboard · Analyze · Trade · Scanner · Account/Billing.
**Auth:** Sign in / up (Clerk, already integrated).

## 6. The four core app screens
1. **Dashboard** — sector tiles (Stocks, Crypto, Futures*[later]*); pick sector → ticker →
   live TradingView chart pops up. Favorites/watchlist front and center.
2. **Analyze** — TradingView Advanced chart + concept toggles (FVG, BOS, MSS, order block,
   liquidity) as one-click overlays. All timeframes (1m → Monthly), 1yr+ history.
3. **Trade** — a live feed of AI-generated high-probability setups streaming by sector,
   each tagged with trade type + full plan. Filter by sector.
4. **Scanner** — type any ticker → AI probability read + the best current setup.

\*Futures deferred under the lean-data decision; v1 ships stocks + crypto.

## 7. The signal engine (your core IP) — built in stages
- **v1 — rules-based & honest.** Compute directly from price (OHLC): market structure
  (BOS/MSS), order blocks, fair value gaps, liquidity sweeps, plus trend/momentum (EMA,
  RSI, volume). Score each setup 0–100 = "probability." Deterministic and explainable.
- **v2 — backtest-calibrated.** Use 1yr of history to weight which patterns actually
  resolved, so the score means something.
- **v3 — ML layer** only if the data justifies it.

> "Probability" = structural/historical confidence, clearly labeled — never a guarantee.

## 8. Data & charts (lean budget)
- **Charts:** TradingView Advanced Charts widget — free, pro-grade, every timeframe, deep
  history, drawing tools. Instantly matches TradingView/ThinkorSwim.
- **Quotes + candles for the signal engine:** Finnhub free tier (stocks + crypto), already wired in.
- **Accepted constraints now:** futures and true global deep-history are deferred; some
  free-tier data is delayed. The UI is built so swapping in a paid data source later is a drop-in.

## 9. Tech stack (evolving what's live)
**Keep:** React + Vite, your token-based CSS, Clerk auth, Vercel hosting.
**Add (all free/low-cost):**
- TradingView widget (charts)
- Supabase (free Postgres) — watchlists, favorites, saved plans, settings
- Stripe — subscriptions + billing portal
- Vercel serverless functions — signal engine, scanner, and anything that must hide a key
- Analytics — Vercel Analytics or PostHog free tier + custom events

## 10. Design direction (full spec in DESIGN-SYSTEM.md)
Evolve your dark + cyan/gold identity toward a more refined, premium feel: deeper layered
neutrals, restrained accent use, more whitespace, crisp tabular typography, subtle motion.
Benchmarks: Stripe (clarity), TradingView (clean data density), Coinbase (trust), Linear (polish).

## 11. Compliance essentials (must-have at launch)
- Persistent **"Educational — not financial advice"** disclaimer.
- Terms of Service, Privacy Policy, Risk Disclosure.
- No language promising profit or returns; "probability" framed strictly as analysis.
- Explicit: *"You execute on your own broker. TAPP places no trades."*
- Cookie/consent + GDPR-aware data handling (global audience).

The Compliance agent drafts these in Phase 4 and reviews copy throughout.

## 12. SEO / Analytics / CRO (later phases, flagged now)
- **SEO:** marketing pages need crawlable content. Vite is weak here — if SEO becomes a
  priority we add a small static/SSR marketing layer (Astro or Next) *in front of* the app.
  This is the one place the "evolve, don't rebuild" choice has a known trade-off.
- **Analytics:** instrument the signup → activation → subscribe funnel, scanner usage, watchlist adds, churn.
- **CRO:** optimize home → signup and free → paid.

## 13. Success metrics (KPIs)
- **Acquisition:** visits, signup rate.
- **Activation:** % who run a scan or add a favorite in their first session.
- **Monetization:** free → paid conversion, MRR, churn.
- **Engagement:** weekly active users, scans per user.

## 14. Risks & honest constraints
- Free data tiers limit real-time depth and exclude futures (deferred by design).
- "AI probability" must be calibrated (v2 backtest) or it's just decoration.
- Signals carry compliance exposure — handled via disclaimers + terms.
- Vite's SEO weakness for marketing — addressable later without a full rebuild.

## 15. Immediate next steps
1. You review this + `DESIGN-SYSTEM.md`.
2. I render a **live visual homepage + Analyze mockup** so you see the new look, not just read it.
3. Phase 2 build: TradingView into Analyze, Dashboard sector → ticker flow, v1 signal
   engine feeding Trade + Scanner (mock data → real).
