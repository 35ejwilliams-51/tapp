# TAPP — Trading Platform UI

Responsive React implementation of the TAPP design system (Parts 1–7), spanning
mobile, tablet, desktop, and ultra-wide on a single token source.

## Run it

```bash
npm install
npm run dev
```

Then open the printed localhost URL. Resize the window to cross the breakpoints.

## Structure

```
tapp/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              entry — imports styles, mounts App
    ├── App.jsx               breakpoint orchestration (wrapped in LiveProvider)
    ├── live.jsx              Finnhub WebSocket feed + simulated fallback + LiveBar
    ├── hooks.js              useMediaQuery
    ├── data.js               mock data (replace with live feed)
    ├── styles/
    │   ├── tokens.css        ← single source of truth (Part 1, dark + light)
    │   └── app.css           component/layout styles (Parts 2–7)
    └── components/
        ├── primitives.jsx    Sparkline, CandleChart, Toggle
        ├── cards.jsx         ScannerHeroCard, SecondaryCard
        ├── nav.jsx           SideRail, BottomNav, TabItem
        ├── panels.jsx        Portfolio, Scanner, Watchlist, Chart, Alerts, ScannerScreen
        ├── screens.jsx       Home, Profile, mobile Chart/Alerts
        ├── ticker.jsx        Ticker detail overlay + order ticket + UI nav context
        └── auth.jsx          Login / signup gate (mock onAuth seam)
```

Every visual value lives in `tokens.css`. Components reference tokens only —
retheme there and nowhere else.

## Breakpoints

| Width        | Layout      | Panels                                                   | Nav         |
|--------------|-------------|----------------------------------------------------------|-------------|
| < 1000px     | mobile      | single-column scanner                                    | bottom bar  |
| 1000–1279px  | tablet      | 3-panel — Scanner 40 / Chart 35 / Alerts 25              | side rail   |
| 1280–2559px  | desktop     | 4-panel — Portfolio 20 / Scanner 25 / Chart 35 / Alerts 20 | side rail |
| ≥ 2560px     | ultra-wide  | 5-panel — Portfolio 18 / Scanner 22 / Watchlist 15 / Chart 30 / Alerts 15 | side rail |

Note: an iPad in portrait (~768–834px) shows the mobile layout by design — the
3-panel dashboard is a landscape pattern.

## Reconciliations vs. the raw spec

These are deliberate implementation choices; each is reversible at the noted token/spot.

- **Direction never relies on colour.** Every change value carries a ▲/▼ glyph
  and a +/− sign alongside the cyan/red (WCAG 1.4.1). Cyan-for-bullish is kept
  as the brand accent. To switch to green-for-gains, change `--color-cyan` use
  in the positive states, or repoint a dedicated `--bull` token.
- **Primary-button ink.** White on bright cyan failed the spec's own AAA bar, so
  `--btn-primary-ink` is near-black in dark mode. Revert in `tokens.css` if desired.
- **Premium gradient border.** Rebuilt with the layered-background technique;
  `border-image` would have squared off the rounded corners.
- **Accessible controls.** Tabs, header buttons, and the toggle are real
  `<button>`/`role="switch"` elements with `aria` and visible focus rings.
- **Touch targets.** Header icon buttons are 44px (spec minimum); mobile tab
  items 60px.

## Known caveats

- **Light mode contrast.** Bright cyan/red are kept for fills, borders, large
  prices, and sparkline strokes; small directional text uses darker ink tokens
  (`--color-cyan-ink` / `--color-red-ink`) that clear 4.5:1 on a light surface.
  Both themes pass contrast for text.
- **All data is mock** (`src/data.js`). Before real use, the "94% confidence" /
  "Strong Buy" signal language should go past compliance — performance claims on
  a trading product draw regulatory scrutiny.
- **Charts are illustrative SVG**, not a charting library. Swap `CandleChart`
  for your data viz of choice when wiring live prices.

## Live data (Finnhub)

`src/live.jsx` provides a `LiveProvider` + `useLive()` hook. The status bar under
the header shows a **Simulated feed** by default — a random-walk so the real-time
UI is always visible.

**Free setup:** register at https://finnhub.io/register (free, no card), copy your
API key, then `cp .env.example .env` and set `VITE_FINNHUB_KEY=your_key`. On the
next `npm run dev` the app auto-connects to the live feed on load. (You can also
paste a key into the in-app status bar without an env var.) Free tier: 60 req/min,
up to 50 symbols, 1 socket — enough for everything TAPP shows.

Notes for production:
- Day-change uses the real previous close: on connect, `live.jsx` fetches
  Finnhub's `/quote` per symbol and seeds each `open` from `pc`. If the REST call
  is blocked (CORS/sandbox), the seeded baseline is kept.
- Stock trades only stream during market hours; off-hours the feed falls back to
  simulation automatically.
- The candlestick chart is built live by aggregating ticks into time buckets
  (`CANDLE_MS`, 6s for the demo — raise to 60_000+ for real per-minute candles).
  For deep history before the session, add a paid candle-history endpoint; the
  live-built candles cover the current session from connect onward.

## Screens

The app opens on an auth gate. Two paths, chosen automatically:

- **Clerk (real auth, free tier).** Set `VITE_CLERK_PUBLISHABLE_KEY` and the app
  renders Clerk's hosted sign-in/sign-up. Free up to 50K users. Get a key at
  https://clerk.com (Dashboard → API keys → Publishable key), add it to `.env`,
  `npm install`, and run. The signed-in name/email flow to the Home greeting and
  Profile; **Sign out** uses Clerk's session.
- **Mock (no key).** Without the key, the built-in gate (`auth.jsx`) is used —
  sign in / create account with basic validation and a "Skip for demo" shortcut.
  Keeps the project (and the in-chat preview) working with zero setup.

The selector lives in `App.jsx` (`ClerkGate` vs `MockGate`); both hand the same
`{ name, email }` shape to the app, so nothing downstream changes.

All five tabs are functional. On mobile each tab is a full screen (Home, Scanner,
Chart, Alerts, Profile); on tablet+ the Scanner/Chart/Alerts live together in the
dashboard while Home and Profile are dedicated screens. `Home` is a market
snapshot (live index chips, portfolio summary, top opportunity, recent alerts);
`Profile` is the account screen (plan, preference toggles wired to the real theme
switch, account rows).

Tapping any scanner card, watchlist row, or **Review trade** opens the ticker
detail overlay (`ticker.jsx`): live chart, stats, AI signal, and Buy/Sell. Buy or
Sell opens an order ticket (side, quantity, market/limit, estimated cost) that
confirms with a simulated fill. Both are accessible dialogs — `aria-modal`, Escape
to close, focus moves in on open and returns to the trigger on close, and Tab is
trapped inside. `UIProvider` holds the navigation state; orders are mock — wire
them to your execution API where the ticket calls `setDone`.

## Remaining work (needs your infrastructure)

The front end is feature-complete, and live data + auth are wired (free tiers).
What's left needs your accounts/infrastructure:

- Wire the order ticket to a real execution / brokerage API (Alpaca etc.).
- Hook up billing (Stripe) behind the Profile plan tiers.
- A real engine behind the AI signal copy — and a compliance review of the
  "confidence %" / "Strong Buy" language before it ships.
- Deeper chart history (pre-session candles) via a paid data endpoint if needed.
