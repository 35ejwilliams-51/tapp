# TAPP — QA Report

_Date: 2026-06-30 · Scope: src/App.jsx, copilot.jsx, screens.jsx, nav.jsx, panels.jsx, cards.jsx, ticker.jsx, primitives.jsx, live.jsx, auth.jsx, hooks.js, data.js, styles_

## Build status

**PASS.** Bundled clean with esbuild 0.21.5 (`esbuild src/main.jsx --bundle --jsx=transform --loader:.js=jsx`), exit code 0, **no warnings**. All imports resolve, including `@clerk/react@^6.7.3` (the v6 alias package; installed and present in node_modules — not a missing/wrong import). No unresolved modules, no syntax errors.

> Note: the project's own `vite build` cannot run in this environment (Windows-native node_modules binaries), so the check above is a Linux esbuild bundle compile only — it verifies the module graph and JSX compile, not a full production Vite/Rollup build.

## Note on scope

The task brief mentions "new concept toggles", an "MMXM concept catalog", a "Power of Three" worked example, and a "long concept-toggle row" (and the task list shows items #10–15 covering these). **None of that code exists in the current `src/` tree.** `docs/CONCEPTS.md` exists but no concept-overlay UI / toggle row is wired into `copilot.jsx`, `AnalyzeChart`, or anywhere else. The only `Toggle` usage is the theme/notification switches in `App.jsx` header and `ProfileScreen`. So the concept-toggle row, its keyboard/aria, and its mobile overflow **could not be reviewed — they are not in this build.** Flagging in case those changes live on an unmerged branch or were reverted.

## Issues

| # | Severity | File | What happens | Suggested fix |
|---|----------|------|--------------|---------------|
| 1 | **High** | copilot.jsx (`TradeScreen`, ~L243–296) | The Trade screen order flow has **no validation gate**. `Review Order` / `Confirm Order` are always enabled. With qty empty/`0`, or a negative/NaN limit/stop/TP, you can still reach "Order confirmed". `q` is clamped (`Math.max(0, Number(qty)||0)`) so a qty of `""` or `-5` silently becomes 0 and confirms a 0-share, $0 order. Contrast with `OrderTicket` (ticker.jsx) which correctly computes `valid` and disables the button. | Compute a `valid` flag (`q > 0 && px > 0` and, for Limit/Stop, the price > 0) and disable `Review Order`; block `setStage("review")` unless valid. Mirror the `OrderTicket` pattern. |
| 2 | **Med** | copilot.jsx (`TradeScreen`, L257–271) | The price/stop/TP `<input type="number" min="0">` fields accept **negatives and non-numeric text** despite `min="0"` (HTML `min` is only enforced on spinner/validation, not typed input). A negative `limit` flows into `px = Number(limit) || price` → negative `est` ("Estimated cost -$…"). Stop/TP have no numeric guard at all. | Clamp on change (`Math.max(0, Number(v))`) or validate before allowing review; reject `NaN`. At minimum guard `px`/`est` so they can't go negative. |
| 3 | **Med** | copilot.jsx (`TradeScreen`, L257) | When **Order Type = "Stop"**, the conditional `type !== "Market"` still renders the field labeled **"Limit Price"** (and `aria-label="Limit price"`). For a stop order this is the wrong label — confusing and inaccurate. | Make the label/aria depend on `type`: "Stop Price" when `type === "Stop"`, else "Limit Price". |
| 4 | **Med** | copilot.jsx (`TradeScreen`, L238–241) + ticker.jsx (`OrderTicket` segs, auth.jsx seg) | The Buy/Sell (and Order-type) segmented controls use `role="tab"` on buttons but there is **no `role="tabpanel"` and no `tablist`→panel wiring** (`aria-controls`/`id`). Screen readers announce "tab" with no associated panel. These are really toggle/radio groups, not tabs. | Either use `role="radiogroup"`/`role="radio"` with `aria-checked`, or add a real `tabpanel` + `aria-controls`. Lower-effort: switch to radio semantics. |
| 5 | **Med** | copilot.jsx (`TradeScreen`, L230) + app.css `.tt-chg` (L472) | **Color-only signaling.** The trade-ticker % change shows the value with an inline `color` and a **hardcoded cyan pill background** (`.tt-chg { background: rgba(0,255,255,.12) }`) — no ▲/▼ glyph, and the pill stays cyan even when the value is negative (`down`). Everywhere else in the app pairs an arrow with color; this spot relies on hue alone. | Add the `{up ? "▲" : "▼"}` glyph (as elsewhere) and/or make the pill background reflect direction; don't rely on color alone. |
| 6 | **Med** | copilot.jsx (`TradePlanCard`, L33–38; `cp-v neg/pos`) | The Trade Plan cells (Entry/Stop/TP1/TP2) convey meaning **by text color class only** (`cp-v pos` / `cp-v neg`) with no label or glyph distinguishing stop vs target. Fails color-only / contrast guidance for colorblind users. | Add a small textual/icon cue (e.g. "SL"/"TP" prefixes already exist as keys, but the value coloring is decorative-only — acceptable if keys are the signal; verify contrast of red/green inks meets 4.5:1). |
| 7 | **Low** | primitives.jsx (`Sparkline`, L13) | `aria-label` is `Trend ${direction === "down" ? "down" : "up"}` — so **`direction="gold"` always announces "Trend up"** regardless of the underlying series. Watchlist/cards pass `gold` for FX/BTC/GLD, so a falling gold row is announced as up. Minor since sparklines are decorative alongside labeled % text. | Pass/derive the real up/down for the aria-label, or mark the sparkline `aria-hidden` since the row already has a descriptive `aria-label`. |
| 8 | **Low** | screens.jsx (`ChartScreen` L171, `AlertsScreen` L174) | **Dead exports.** `ChartScreen` and `AlertsScreen` are defined but imported nowhere (chart/alerts tabs were removed from `TABS`). Harmless but dead code; `ChartScreen` also hardcodes `calc(100vh - 220px)`. | Delete both, or wire them back if intended. No runtime impact. |
| 9 | **Low** | App.jsx (L7, header) | `ChartPanel`/`AlertsPanel` are still used in the desktop dashboard grid (not dead). The header **Notifications (Bell) and Account (User) buttons have `aria-label`s but no `onClick`** — they are inert. Clicking does nothing. | Wire handlers or remove until implemented, so users aren't left clicking dead controls. |
| 10 | **Low** | copilot.jsx (`AnalyzeChart` L141–142, `az-tool` buttons) | The toolbar buttons "Indicators / Layout / Save / AI Analyze" and timeframe `tf-btn`s (and ChartPanel's tf-row L103) are **purely visual — no handlers** (tf only sets local state with no effect). Expected for a mock, but they look interactive. | Acceptable for mockup; consider `aria-disabled` or a "demo" affordance if shipping. |
| 11 | **Low** | nav.jsx (`cap`, L7) | `cap(s) => s[0].toUpperCase()...` will **throw on an empty string** (`s[0]` undefined → `.toUpperCase()` on undefined). Only reachable if a falsy tab id is passed to `Placeholder`/`labelFor`; current `TABS` are all non-empty so not hit in practice. | Guard: `s ? s[0].toUpperCase()+s.slice(1) : ""`. |
| 12 | **Low** | live.jsx (`LiveBar`, L196–201) + status meta | If `live` context were ever null, `status` defaults to "simulated" (fine), but `meta` is indexed by `status` with no fallback — an unexpected status string would make `meta` undefined and `meta.c` throw. All current code paths set known statuses, so low risk. | Add `|| meta.simulated` fallback on the lookup. |
| 13 | **Low** | App.jsx mobile (L111–117) | Mobile screen map has keys `scanner/home/analyze/trade/profile`; default falls back to `Placeholder`. With 5 fixed tabs this default is unreachable — consistent, no bug. The `tab` initial value is `"scanner"` on both layouts. | None needed; noted for completeness. |
| 14 | **Low** | screens.jsx (`HomeScreen` L29–31) | The portfolio summary hardcodes a **`▲` up-arrow and cyan "today" color** unconditionally (`PORTFOLIO_TOTAL` is static mock). If `PT.change` were ever negative it would still show ▲/green. Mock data only. | Drive arrow/color from `PT.change`/`PT.pct` sign for correctness when real data lands. |
| 15 | **Low** | panels.jsx (`PortfolioPanel` L15–18) | Portfolio total/`+$1,842 (3.05%)` is **hardcoded in JSX** and won't match live data or `PORTFOLIO_TOTAL`. Header says "4 positions" hardcoded too. Mock only. | Source from data/live when wiring real feed. |
| 16 | **Low** | copilot.jsx (`TradeScreen` Buy/Sell `seg-lg`) vs others | On the Buy/Sell toggle, only color + `.active` background distinguishes the selected side; `aria-selected` is set (good), but the visual selection for **Sell active** relies on red tint — pair with the existing arrow/label is fine since text "Buy"/"Sell" is present. No action. | None. |

## Accessibility — positives confirmed

- Focus-visible outlines are defined consistently across interactive elements (tabs, rail, buttons, inputs, toggles). Good coverage.
- `useDialog` (hooks.js) implements a real focus trap + initial focus; `UIProvider` centralizes Escape and restores focus to the trigger on close (`openTicker`/`closeTicker` with `triggerRef`). Solid.
- `Toggle` uses `role="switch"` + `aria-checked` + `aria-label`. Bias bar uses `role="meter"` with valuemin/now/max.
- Most price/change displays correctly pair ▲/▼ glyphs with color (not color-only) — exceptions noted as #5/#6.
- Number inputs in `OrderTicket` (ticker.jsx) are properly validated (`valid` gate, disabled button) — the gap is specifically in `TradeScreen` (#1).

## Responsive / layout

- Breakpoint ladder in App.jsx (1000/1280/2560) is coherent; `grid-3/4/5` use `fr` columns and `analyze-layout` uses `minmax(0,1fr)` to prevent blowout. No obvious horizontal-overflow risk in the dashboard grids.
- `az-tools` and `az-tfs` use `flex-wrap: wrap`, so the analyze toolbar won't overflow on narrow widths.
- Bottom `tab-bar` has 5 items with `flex:1` and `max-width:430px` centered — 5 tabs fit; labels are 11px. On very small phones the 5 labels are tight but won't overflow (flex distributes). No dead chart/alerts tab remains in `TABS`.
- `tf-pair` is a fixed `1fr 1fr` grid — fine.

## Fixes applied in this pass

**None.** Every issue above is either a behavior/semantics change (validation, aria role swap, label text, color logic) that exceeds the "trivial, guaranteed-safe" bar, or is intentional mock/dead code. Per instructions these are reported rather than changed. The highest-value safe change to make next is **#1 (gate the Trade order flow on a `valid` flag)**, mirroring the existing `OrderTicket` implementation.
