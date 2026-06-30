# TAPP — Design System Direction (v1)

*Evolution of your existing `tokens.css`, not a replacement. Goal: keep your dark +
cyan/gold identity but push it to the polish level of Stripe / TradingView / Coinbase /
Linear. Full visual UI kit comes next as a live mockup.*

---

## 1. Brand feel
A quiet, expensive trading terminal. **Precision over neon.** Data-dense but calm:
more whitespace, less glow, sharper type, restrained accent use. Confidence comes from
hierarchy and consistency, not effects.

## 2. Color — refine, don't rip out
Keep dark-first and your token architecture; retune values and add depth layers.

**Surfaces (layered neutrals):**
| Token | Now | Proposed |
| ----- | --- | -------- |
| bg (base)        | `#000000` | `#07090D` |
| surface (panel)  | `#05070C` | `#0E1116` |
| elevated (card)  | glass     | `#161A21` |
| hairline         | white .10 | `rgba(255,255,255,.08)` |

**Accents (use sparingly):**
- **Cyan** — primary action + bullish/positive. Dial the glow *down*; reserve glow for one focal element per view.
- **Gold** — premium / high-confidence highlights only. Not a general accent.
- **Semantic:** cyan/green = bullish, red = bearish, amber = caution.

**Text ramp:** primary `#F5F7FA` · secondary `#9BA3AF` · tertiary `#5B6673` (tune each for 4.5:1 contrast).

## 3. Typography
- **One UI family:** Inter or Geist (clean, modern, screen-optimized). Keep it to one family + system fallback.
- **Numbers are tabular everywhere** (`font-variant-numeric: tabular-nums`) — prices must not jitter.
- **Hierarchy:** large confident prices, medium section titles, small dense data labels. Generous line-height on body, tight on numbers.

## 4. Spacing & layout
- 4px base scale (you already have this) — but use *more* whitespace than the current build.
- Consistent card padding (20–24px), radii 12–18px, max content widths so wide screens don't sprawl.
- Grid-driven panels; align everything to the baseline.

## 5. Component kit
Most of these already exist — we refine and add the new ones (★).

- Buttons: primary / secondary / ghost / danger
- Inputs, selects, search, segmented tabs
- Cards: panel · hero · premium (gradient rim)
- Badges: market-bias · confidence · ★ sector · ★ trade-type
- Data row, watchlist row, ★ sector tile, ★ setup/signal card, trade-plan card
- Sparkline, ★ TradingView chart container, concept-toggle pills (FVG/BOS/MSS/OB/liquidity)
- Modal / bottom sheet, toast, skeleton loader
- Navigation: side rail (desktop) · bottom bar (mobile) · top header

## 6. Motion
Subtle and fast: 150–300ms ease. Micro-hover lifts, number tick animations on price
changes, skeleton loaders on data fetch. No heavy bounce. Honor `prefers-reduced-motion`
(already in your CSS).

## 7. Iconography
Stick with **lucide-react** (already in use) — consistent stroke weight, no mixing icon sets.

## 8. Accessibility
- Maintain contrast (your tokens already track text-safe accent variants — keep that discipline).
- Visible focus states on every interactive element.
- Full keyboard nav; reduced-motion support; ARIA on charts and live regions.

## 9. Light mode
You already have `[data-theme="light"]` tokens. We keep it functional but treat **dark as
the hero**; light mode gets a polish pass in a later phase.

## 10. Next
I'll render a **live visual UI kit + homepage concept** (real HTML you can see and click),
so we lock the look before Phase 2 coding. Say the word and I'll build it.
