# TAPP — Competitor & UX Research

_Research date: 2026-06-30. Pricing changes often — figures below were verified via web search on this date and should be re-checked before any marketing copy ships._

TAPP is a trading-analysis subscription web app. It scans markets, auto-detects ICT/SMC setups (order blocks, FVG, liquidity, market structure, Power-of-Three), and hands retail traders a clean, plain-English trade plan to execute on **their own broker**. TAPP never executes trades. This document studies the competitive field, identifies the gap TAPP can own, and gives concrete UX recommendations for the 4 core screens (Dashboard, Analyze, Trade, Scanner), onboarding, and trust/conversion.

---

## 1. Competitor landscape

### Snapshot table

| Product | Core value prop | Entry price | Top tier | Best at | Gap for TAPP to exploit |
|---|---|---|---|---|---|
| **TradingView** | Best-in-class charting + huge community + alerts | ~$12.95/mo (Essential, annual) | Ultimate ~$199.95/mo | Charts, alerts, cross-device sync, community scripts | Doesn't *interpret* setups for you; ICT/SMC requires third-party scripts you must read yourself |
| **thinkorswim (Schwab)** | Pro desktop platform, free with brokerage | Free w/ Schwab acct | Free | Options analytics, 400+ studies, paper trading | Steep learning curve (days to weeks); not retail-beginner friendly; no plain-English setup calls |
| **TrendSpider** | Automated TA: trendlines, patterns, backtesting, bots | ~$59/mo (annual Standard) | ~$149/mo (Premium monthly) | Automation, multi-timeframe, no-code backtesting/bots | Power-user priced & complex; not built around ICT/SMC narrative for beginners |
| **Trade Ideas** | "Holly" AI scans markets, ranks setups | ~$89/mo (Standard) | ~$228/mo (Premium w/ Holly) | AI-ranked real-time alert feed, 300+ strategies | Expensive; opaque AI; day-trader oriented, not concept-education driven |
| **Finviz (Elite)** | Fast, broad stock screener | ~$24.96/mo (annual) | ~$39.50/mo (monthly) | Speed, 70+ filters, breadth, value | Fundamentals/screening focus; no ICT/SMC, no trade-plan synthesis |
| **TipRanks** | Aggregated analyst ratings + "Smart Score" | ~$215/yr (Smart Portfolio) | ~$600/yr (Ultimate) | Trust via aggregation, Smart Score credibility framing | Investor/research angle, not active-trader setups; no charts-first execution plan |
| **ICT/SMC scripts** (LuxAlgo, GoodBadBitcoin, FXMAFIA20, etc.) | Auto-draw order blocks / FVG / BOS / CHoCH on TradingView | Free–~$40/mo | varies | Auto-detecting the exact concepts TAPP targets | They *draw* concepts but don't *explain* them or produce a ranked, plain-English plan for beginners |

Sources: [TradingView pricing](https://www.tradingview.com/pricing/), [TrendSpider pricing](https://trendspider.com/pricing/), [Trade Ideas review](https://www.stockbrokers.com/review/tools/trade-ideas), [Finviz Elite](https://finviz.com/elite), [TipRanks plans](https://www.tipranks.com/plans), [thinkorswim desktop](https://www.schwab.com/trading/thinkorswim/desktop), [LuxAlgo SMC indicator](https://www.tradingview.com/script/CnB3fSph-Smart-Money-Concepts-SMC-LuxAlgo/), [ICT Auto-Validated SMC](https://www.tradingview.com/script/TMihShBr-ICT-Auto-Validated-SMC/).

### Per-competitor detail

**TradingView** — Four paid tiers (Essential ~$12.95, Plus ~$29.95, Premium ~$59.95, Ultimate ~$199.95/mo on annual billing), all with a 30-day free trial. Premium feel comes from charting depth, **cloud-based alerts that "run on powerful servers"**, **watchlist alerts** (one condition applied across a whole list, auto-adjusting as symbols are added/removed), and **synced layouts/watchlists/settings across web, mobile and desktop**. Their own guidance warns that **alert overload erodes trust** — fewer, well-structured alerts keep the system credible. ([pricing](https://www.tradingview.com/pricing/), [watchlist alerts](https://www.tradingview.com/blog/en/watchlist-alerts-on-tradingview-49839/), [alerts intro](https://www.tradingview.com/support/solutions/43000520149-introduction-to-tradingview-alerts/))

**thinkorswim (Schwab)** — Free with a Schwab account. Extremely deep (400+ studies, options Greeks/probability, Risk Profile, scanners, paper trading with $100k virtual). But reviewers say to **budget a week of daily use** and 2-4 hours just to configure a workspace — the opposite of TAPP's beginner promise. ([desktop](https://www.schwab.com/trading/thinkorswim/desktop), [setup guide](https://tradingtoolshub.com/blog/thinkorswim-setup-guide-the-complete-walkthrough/))

**TrendSpider** — Automated TA (trendline/pattern detection, multi-timeframe, no-code backtesting, AI Strategy Lab, cloud bots), broker connect via SignalStack. Priced for power users (~$59-$149/mo). Strong "automation" story but not framed around ICT/SMC narrative or beginner education. ([pricing](https://trendspider.com/pricing/), [review](https://www.stockbrokers.com/review/tools/trendspider))

**Trade Ideas** — "Holly" AI scans markets and surfaces ranked setups across 300+ strategies; Premium (~$228/mo) adds Smart Risk Levels, OddsMaker backtesting, and a 2nd-gen "Money Machine" execution-ranking layer. Closest analog to TAPP's "AI-ranked setups" idea — but expensive, opaque, and aimed at active day traders, not concept-learning retail. ([virtual assistant](https://www.trade-ideas.com/ti-ai-virtual-trade-assistant/), [review](https://www.stockbrokers.com/review/tools/trade-ideas))

**Finviz** — Free tier is famous; Elite (~$24.96/mo annual) adds real-time data, 70+ filters, backtesting, alerts, export/API. Best-in-class **fast, broad screener** and a price anchor TAPP should respect — but it is fundamentals/screening, not setup interpretation. ([Elite](https://finviz.com/elite), [review](https://www.stockbrokers.com/review/tools/finviz))

**TipRanks** — Aggregates analyst ratings into a **"Smart Score"** credibility signal; plans roughly $215-$600/yr with a 30-day money-back guarantee. Its trust model — *aggregate many signals into one easy score* — is the single most transferable trust pattern for TAPP. ([plans](https://www.tipranks.com/plans), [review](https://www.stockbrokers.com/review/tools/tipranks))

**ICT/SMC indicator scripts** — LuxAlgo's SMC, GoodBadBitcoin's "ICT Auto-Validated SMC" (only draws an order block after a liquidity sweep + displacement, with a **confluence score**), FXMAFIA20's OB & FVG, etc. They auto-draw the exact concepts TAPP detects — proving demand and feasibility — but they stop at *drawing*. None turn the chart into a ranked, plain-English plan a beginner can act on. ([LuxAlgo SMC](https://www.tradingview.com/script/CnB3fSph-Smart-Money-Concepts-SMC-LuxAlgo/), [ICT Auto-Validated SMC](https://www.tradingview.com/script/TMihShBr-ict-auto-validated-smc/), [best smart-money indicators](https://grandalgo.com/blog/best-smart-money-tradingview-indicators))

---

## 2. The market gap TAPP can own

> **No mainstream tool auto-detects ICT/SMC setups _and_ explains them in plain English _and_ produces a ready-to-execute plan for a retail beginner — at an accessible price.**

The field splits into three camps, each leaving TAPP's lane open:

1. **Charts/screeners (TradingView, Finviz, thinkorswim)** — give you the canvas and the data, but you must *know* ICT/SMC and interpret it yourself.
2. **AI signal engines (Trade Ideas, TrendSpider)** — rank setups, but are opaque, expensive, and day-trader-coded; they don't *teach* the concept behind the call.
3. **ICT/SMC scripts** — draw the right concepts, but for an audience that already speaks the language; no synthesis, no education, no plan.

**TAPP's ownable wedge:** _"See the smart-money setup, understand why it's there, and get a plain-English plan — in under a minute, on any ticker."_ It marries (a) auto-detection of the exact ICT/SMC concepts these scripts prove are detectable, (b) a TipRanks-style single readable confidence score, and (c) a beginner-friendly explanation + trade plan that none of the three camps deliver. Pricing sweet spot sits between Finviz (~$25) and TradingView Premium (~$60) — clearly value-accessible vs. Trade Ideas (~$228).

---

## 3. UX recommendations by screen

### Dashboard (sector → ticker → live chart)
- **Lead with motion, not a blank state.** On first load show a small set of "setups detected today" cards even before the user picks a sector — give an instant reason to click.
- **Drill-down breadcrumb** (Sector › Ticker › Chart) kept persistently visible so beginners never feel lost; one click back at every step.
- **Heat-style sector grid** (Finviz's strongest, fastest pattern) but scored by *TAPP setup density*, not just % change — "where is smart money active right now."
- **Each ticker tile carries a single TAPP score chip** (see Trust section) so the eye is trained to read one credibility number, TipRanks-style.
- Embed TradingView chart with TAPP's detected concepts pre-drawn; a "Why?" affordance on every drawn zone.

### Analyze (chart + one-click concept breakdown)
- **One-click "Break it down"** is the hero action. Tapping it overlays detected concepts (OB, FVG, liquidity, structure, PO3) AND opens a plain-English side panel: _what it is_, _why it formed here_, _what it implies next_.
- **Toggle each concept layer independently** (you already do this in the build) so users learn one concept at a time — progressive disclosure.
- **Confluence scoring per zone** (proven by GoodBadBitcoin's "every concept earns its place") — show *why* a zone is high-quality, not just that it exists. This is a credibility differentiator.
- **"Explain like I'm new" vs "Pro" verbosity toggle** so the same screen serves beginner→intermediate.
- End every breakdown with a "Turn this into a plan" CTA that routes to a clean trade plan (entry / invalidation / target zones) — clearly labeled as a *plan to review*, not advice.

### Trade (AI-ranked high-probability setups feed)
- **Ranked feed, not a wall of alerts.** TradingView's own warning is that alert overload kills trust — cap the feed to the few highest-confluence setups and let users expand. Curate, don't flood.
- **Each card = one setup, one score, one sentence.** Ticker, direction, TAPP score, plain-English thesis ("Price swept liquidity below the low and tapped a 1H demand order block"). Expand for the full plan.
- **Show the reasoning chain** (avoid Trade Ideas' opacity complaint): the concepts that produced the ranking are listed and link back to Analyze.
- **Filters by concept, timeframe, and confidence band** — not 70 filters; a curated handful beginners can grasp.
- **"Save to watchlist" + optional alert** on each card, with TradingView-style watchlist alerts (one condition across the list) rather than per-symbol alert sprawl.

### Scanner (type a ticker → probability read)
- **Single search box, instant read** — this is TAPP's fastest "aha." Type AAPL, get a probability read + the top detected setup in seconds. This should be the lowest-friction surface in the app.
- **Result = headline score + 2-3 supporting bullets + a "see full breakdown" link** into Analyze. Don't dump everything; tease and route.
- **Recent / trending tickers as tappable chips** under the box so a user with no ticker in mind still gets value.
- **Empty/disabled honesty:** if no clean setup exists, say "No high-probability setup right now" — never manufacture a signal. This is a trust multiplier.

---

## 4. Onboarding / first-run — get to "aha" in <60s

Research consensus: **speed to value means showing something valuable _before_ onboarding finishes**, starting with *context not forms*, and separating "needed to sign up" (name, email) from "needed later." ([Skins Factory](https://www.theskinsfactory.com/uiux-design-blog/fintech-onboarding-ux-design), [Eleken](https://www.eleken.co/blog-posts/fintech-onboarding-simplification), [Userpilot](https://userpilot.com/blog/fintech-onboarding/), [Lollypop trading-app design](https://lollypop.design/blog/2026/june/trading-app-design/))

**Recommended first-run flow:**
1. **No wall.** Land the user straight on the **Scanner** with a pre-filled popular ticker already showing a live probability read + one detected setup. Value before signup.
2. **"Try your own ticker"** — they type one symbol and watch TAPP break it down live. _This is the aha: a complete plain-English read in well under 60 seconds._
3. **One guided breakdown** — a single contextual tooltip walks them through reading the score and one concept (not a 6-step tour).
4. **Only then ask to save** — "Create a free account to save this and get daily setups." Account ask arrives *after* value, framed by what they just saw.
5. **Paper/no-money framing throughout** — like Robinhood/Schwab simplification, build confidence with zero capital pressure; TAPP never executes anyway, so lean into "review on your own terms."

Target: **first meaningful read on screen in <10s, first self-driven scan in <60s, account creation deferred until after the aha.**

---

## 5. Trust & conversion patterns to adopt

TAPP sells signals, so it must feel **credible and compliant** without ever crossing into advice.

**Credibility (what legitimate services do):**
- **Lead with data, not lifestyle.** Reviewers flag that scams lead with testimonials and Lamborghinis; legit services lead with verifiable track records, win rates, drawdown. Show a **searchable history of past calls including the losers** — a public "closed setups" ledger. ([trust/red-flags](https://www.tradealgo.com/trading-guides/ai-trading/ai-trading-signals-review), [transparency example](https://verifiedinvesting.com/products/smart-money-stocks-etfs))
- **Honest numbers.** Real strategies show ~45-65% win rates with 1.5-3:1 R:R and visible drawdowns; a flawless smooth equity curve reads as curve-fit and *reduces* trust. State methodology, out-of-sample validation, and that costs aren't included. ([backtest metrics](https://www.goatfundedtrader.com/blog/backtesting-day-trading-strategies))
- **Adopt a TipRanks-style single "TAPP Score."** Aggregating signals into one readable score is a proven trust pattern — but always make it expandable to *show the reasoning* (counters the Trade Ideas opacity complaint). ([TipRanks](https://www.tipranks.com/plans))
- **Premium feel = reliability + consistency.** Mirror TradingView: fast cloud-backed alerts, synced state across devices, and **curated, low-noise alerts** (alert overload erodes trust). ([TradingView alerts](https://www.tradingview.com/blog/en/watchlist-alerts-on-tradingview-49839/))

**Compliance / "educational, not advice" framing:**
- Label content **educational/informational only**, give **no personalized recommendations**, and **avoid telling a specific user to buy/sell**. Use plan language: "setup," "potential," "for your review" — never "you should buy." ([compliance practices](https://www.one-signal.com/news-insights/how-to-spot-trading-signal-scams-7-red-flags-to-avoid))
- Persistent, plain disclaimer ("Educational content only. Not financial advice. TAPP does not execute trades.") on every signal/plan surface — but note disclaimers don't override securities law; **regulators look at substance over disclaimers**, so the product must genuinely stay informational and route execution to the user's own broker. Have it reviewed by counsel before launch. ([legal note](https://www.justanswer.com/business-law/pgk8m-looking-start-stock-market-education-website.html))
- "TAPP never executes trades" is a **trust asset** — lean on it: no custody of funds, no order placement, lower regulatory surface, and it reinforces the user-in-control framing.

**Conversion:**
- **30-day trial / money-back guarantee** is table stakes (TradingView and TipRanks both use it) — adopt it to de-risk signup.
- **Value-anchored pricing** between Finviz (~$25) and TradingView Premium (~$60); position explicitly against Trade Ideas' ~$228 as "pro-grade setup detection without the pro-grade price."
- **Defer the account ask** until after the Scanner aha (Section 4).

---

## Summary

**Biggest UX opportunity:** TAPP can own the unclaimed middle of the market — _auto-detected ICT/SMC setups translated into a plain-English, ranked trade plan a beginner can act on in under a minute._ Charting tools make you interpret it yourself, AI engines are opaque and pricey, and ICT/SMC scripts only draw concepts for people who already speak the language. The **one-tap "break it down" → readable TAPP Score → ready-to-review plan** loop is the experience nobody else delivers.

**Top 3 recommendations:**
1. **Make the Scanner the front door and the aha** — land users on a live probability read before any signup, let them type their own ticker, deliver a full plain-English breakdown in <60s, then ask for the account.
2. **Adopt a single, expandable "TAPP Score" with a public win/loss ledger** — TipRanks-style one-number credibility, but always show the reasoning chain and never hide losing calls (data over hype).
3. **Curate, don't flood** — cap the Trade feed and alerts to the few highest-confluence setups (alert overload kills trust), wrap everything in consistent "educational, not advice / TAPP never executes" framing, and price the value gap between Finviz and TradingView Premium.

---

### Sources
- [TradingView pricing](https://www.tradingview.com/pricing/) · [features](https://www.tradingview.com/features/) · [watchlist alerts blog](https://www.tradingview.com/blog/en/watchlist-alerts-on-tradingview-49839/) · [alerts intro](https://www.tradingview.com/support/solutions/43000520149-introduction-to-tradingview-alerts/)
- [TrendSpider pricing](https://trendspider.com/pricing/) · [TrendSpider review](https://www.stockbrokers.com/review/tools/trendspider)
- [Trade Ideas AI assistant](https://www.trade-ideas.com/ti-ai-virtual-trade-assistant/) · [Trade Ideas review](https://www.stockbrokers.com/review/tools/trade-ideas)
- [Finviz Elite](https://finviz.com/elite) · [Finviz review](https://www.stockbrokers.com/review/tools/finviz)
- [TipRanks plans](https://www.tipranks.com/plans) · [TipRanks review](https://www.stockbrokers.com/review/tools/tipranks)
- [thinkorswim desktop](https://www.schwab.com/trading/thinkorswim/desktop) · [thinkorswim setup guide](https://tradingtoolshub.com/blog/thinkorswim-setup-guide-the-complete-walkthrough/)
- [LuxAlgo SMC indicator](https://www.tradingview.com/script/CnB3fSph-Smart-Money-Concepts-SMC-LuxAlgo/) · [ICT Auto-Validated SMC](https://www.tradingview.com/script/TMihShBr-ict-auto-validated-smc/) · [best smart-money indicators](https://grandalgo.com/blog/best-smart-money-tradingview-indicators)
- [Fintech onboarding UX (Skins Factory)](https://www.theskinsfactory.com/uiux-design-blog/fintech-onboarding-ux-design) · [Eleken onboarding](https://www.eleken.co/blog-posts/fintech-onboarding-simplification) · [Userpilot fintech onboarding](https://userpilot.com/blog/fintech-onboarding/) · [Lollypop trading-app design](https://lollypop.design/blog/2026/june/trading-app-design/)
- [AI trading signals / red flags](https://www.tradealgo.com/trading-guides/ai-trading/ai-trading-signals-review) · [signal scam red flags](https://www.one-signal.com/news-insights/how-to-spot-trading-signal-scams-7-red-flags-to-avoid) · [transparency ledger example](https://verifiedinvesting.com/products/smart-money-stocks-etfs) · [backtest metrics](https://www.goatfundedtrader.com/blog/backtesting-day-trading-strategies) · [educational-content legal note](https://www.justanswer.com/business-law/pgk8m-looking-start-stock-market-education-website.html)
</content>
</invoke>
