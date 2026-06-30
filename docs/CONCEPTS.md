# TAPP — Trading Concept Catalog (ICT / MMXM)

*Inspiration: "The MMXM Trader Mentorship" (StopLoss Robin) + the broader ICT
methodology. These are the standard definitions — mark up anything you teach
differently and I'll adjust the detection + overlay to match.*

Every concept below becomes a **toggle** on the Analyze chart: click it and the
annotation draws on the candles; click again to hide. Detection in the real app is
computed from OHLC data (Phase 3 signal engine); the mockups show the visual language.

---

## 1. Market structure
| Concept | What it means | How it draws |
| ------- | ------------- | ------------ |
| Break of Structure (BOS) | Price breaks a prior swing high/low **in the direction of trend** — trend continuation. | Horizontal level at the broken swing + arrow + "BOS". |
| Market Structure Shift (MSS) / CHoCH | Price breaks structure **against** the prior trend — first sign of reversal (Change of Character). | Dashed level at the broken point + "MSS / CHoCH". |
| Premium / Discount / Equilibrium | The dealing range split at 50%. Sell in premium (upper half), buy in discount (lower half). | Range shaded red (premium) / cyan (discount), dashed 50% equilibrium. |

## 2. Liquidity
| Concept | What it means | How it draws |
| ------- | ------------- | ------------ |
| Buy-side liquidity (BSL) | Resting stops **above** highs / equal highs. | Dashed line above the highs + "BSL", ✕ marks on equal highs. |
| Sell-side liquidity (SSL) | Resting stops **below** lows / equal lows. | Dashed line below the lows + "SSL". |
| Liquidity sweep / stop run | A wick beyond a level that grabs liquidity then reverses. | Marker at the sweep wick + "Sweep". |
| Equal highs / lows (EQH / EQL) | Two-plus touches at the same level — a liquidity magnet. | Small ✕ ticks at the matching highs/lows. |
| Inducement | A minor pool of liquidity that lures entries before the real move. | Small dashed level + "IDM". |

## 3. PD arrays (Price Delivery Arrays)
These are the institutional reference zones price reacts to.

| Concept | What it means | How it draws |
| ------- | ------------- | ------------ |
| Order Block (OB) | Last opposite candle before a strong move; institutional entry zone. | Shaded zone (cyan bull / red bear) + "Order block". |
| Fair Value Gap (FVG) / imbalance | 3-candle gap where price moved too fast, leaving an inefficiency to be filled. | Shaded band between candle 1 high and candle 3 low + "FVG". |
| Breaker Block | A failed order block that price breaks and then retests from the other side. | Zone outlined in violet + "Breaker". |
| Mitigation Block | An order block revisited so institutions can mitigate (offset) earlier positions. | Zone outlined in teal + "Mitigation". |
| Rejection Block | Zone built from candle wicks (not bodies) that price rejects. | Wick-range band + "Rejection". |
| Volume Imbalance | A small gap between two candle bodies (opens/closes don't overlap). | Thin band between the bodies + "Volume imbalance". |
| Balanced Price Range (BPR) | Overlap of an up-FVG and a down-FVG — a strong reaction zone. | Overlap band + "BPR". |

## 4. Market Maker Models (MMXM) — the mentorship's core
The full institutional cycle, built on a higher-timeframe PD array, executed on a
lower-timeframe MSS.

- **Market Maker Buy Model (MMBM)** — for longs. **Market Maker Sell Model (MMSM)** — for shorts.
- **The four phases:**
  1. **Accumulation** — range-bound; smart money builds positions, liquidity gathers on both sides.
  2. **Manipulation** — a fake breakout that sweeps the stops (Judas swing / liquidity grab).
  3. **Smart Money Reversal (SMR)** — price reverses off the HTF PD array; structure shifts (MSS).
  4. **Distribution** — real momentum in the true direction; shallow pullbacks, clean markup.
- **Power of Three (PO3 / AMD) — OHLC** *(Mentorship Ep. 2)*. A candle delivers in three
  steps — accumulation, manipulation, distribution — read through the order O/H/L/C forms.
  Anchored to the **true day open = New York midnight (00:00 EST)**, not the 5pm open.
  Bias rule: *buy below the midnight line, sell above it.* London session usually prints
  the high or low of the day before a higher-timeframe PD array is hit; New York then
  retraces into continuation (or reverses). Five daily formations:
  - **Bullish (O-L-H-C):** low forms (often London) → expands up → NY retrace into continuation → close near the high, taking buy-side liquidity.
  - **Bullish reversal:** a deep dive below the midnight open runs sell-side liquidity into a HTF discount array (FVG / order block) → reverses up → closes up. Long lower wick.
  - **Bearish (O-H-L-C):** high forms (often London) → expands down → NY retrace into premium → close near the low.
  - **Bearish reversal:** expands up first to run buy stops / hit a HTF premium array → reverses down → closes down. Long upper wick.
  - **Consolidation / indecisional:** seek-and-destroy around the midnight open — runs both buy and sell stops, equal wicks, closes near the open (doji).
- **HTF level can be any PD array:** FVG, breaker, order block, mitigation block, volume imbalance, rejection block, old high/low.

How it draws: vertical phase bands across the chart (Accumulation | Manipulation |
Distribution) with an SMR marker at the reversal, anchored to the HTF PD array.

## 5. Timing (optional layer)
- **Killzones / sessions** — London and New York windows where these models tend to play out. Optional time-shading on the chart.

## 6. Multi-timeframe rule
Bias is set on the higher timeframe (Daily / 4H for swing, 1H intraday). The entry is
the lower-timeframe (15m / 5m) MSS **inside** the HTF PD array. The Analyze view should
make switching HTF↔LTF one click.

---

## Build priority (for Phase 3 detection engine)
1. Structure: BOS, MSS, premium/discount.
2. Liquidity: BSL/SSL, equal highs/lows, sweeps.
3. PD arrays: order block, FVG → breaker, mitigation, volume imbalance.
4. MMXM: the four-phase model + PO3 + SMR (composes the above).

Each detection emits: type, price zone, time range, direction, and a confidence input
to the overall setup score.
