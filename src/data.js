/* ============================================================
   MOCK DATA — placeholder only. Replace with live feed / API.
   Nothing here is real market data.
   ============================================================ */

export const HERO = {
  ticker: "NVDA", name: "NVIDIA Corp", price: 172.40, change: 8.62, changePercent: 5.26,
  confidence: 94, signal: "AI Signal · Strong Buy",
  spark: [22, 24, 23, 27, 26, 30, 29, 34, 33, 38, 41, 46],
};

export const WATCH = [
  { ticker: "TSLA", name: "Tesla", price: "248.10", changePercent: 2.14 },
  { ticker: "AAPL", name: "Apple", price: "229.87", changePercent: 0.61 },
  { ticker: "AMD", name: "Adv. Micro", price: "164.32", changePercent: -1.38 },
  { ticker: "EUR/USD", name: "Forex", price: "1.0842", changePercent: 0.22, gold: true },
  { ticker: "MSFT", name: "Microsoft", price: "441.05", changePercent: 0.92 },
  { ticker: "META", name: "Meta", price: "512.30", changePercent: -0.44 },
];

export const WATCHLIST = [
  { ticker: "SPY", changePercent: 0.41, up: true },
  { ticker: "QQQ", changePercent: 0.78, up: true },
  { ticker: "GOOGL", changePercent: -0.32, up: false },
  { ticker: "AMZN", changePercent: 1.12, up: true },
  { ticker: "COIN", changePercent: -2.05, up: false },
  { ticker: "PLTR", changePercent: 3.44, up: true },
  { ticker: "BTC", changePercent: 1.88, up: true, gold: true },
  { ticker: "GLD", changePercent: 0.15, up: true, gold: true },
];

export const HOLDINGS = [
  { t: "NVDA", s: "120 sh", v: "$20,688", p: 5.26, up: true, w: 34, color: "var(--color-cyan)" },
  { t: "AAPL", s: "80 sh", v: "$18,389", p: 0.61, up: true, w: 30, color: "var(--color-cyan-secondary)" },
  { t: "MSFT", s: "30 sh", v: "$13,231", p: 0.92, up: true, w: 22, color: "var(--color-gold)" },
  { t: "AMD", s: "60 sh", v: "$9,859", p: -1.38, up: false, w: 14, color: "var(--color-red)" },
];

export const CANDLES = (() => {
  let p = 150; const out = [];
  const seq = [3,-1,4,2,-2,5,1,3,-1,6,2,-3,4,5,1,-1,3,2,4,-2,3,6,1,-1,4,2,3,5,2,4];
  for (const d of seq) {
    const o = p, c = p + d;
    const h = Math.max(o, c) + Math.abs(d) * 0.4 + 1;
    const l = Math.min(o, c) - Math.abs(d) * 0.4 - 1;
    out.push({ o, c, h, l }); p = c;
  }
  return out;
})();

export const ALERTS = [
  { tone: "cyan", title: "NVDA broke resistance", desc: "Crossed $170 with rising volume.", time: "2m ago" },
  { tone: "gold", title: "EUR/USD signal", desc: "Momentum shift flagged on 1H.", time: "18m ago" },
  { tone: "red", title: "AMD stop-loss near", desc: "Within 1.2% of your stop at $162.", time: "42m ago" },
  { tone: "cyan", title: "AAPL volume spike", desc: "3.1× average over last 15m.", time: "1h ago" },
];

export const TONE = {
  cyan: "var(--color-cyan)",
  gold: "var(--color-gold)",
  red: "var(--color-red)",
};

/* ============================================================
   COPILOT / ANALYZE / TRADE — mock analysis & plan.
   Placeholder only. Replace with real model output + broker data.
   ============================================================ */

/* TAPP Copilot ICT/SMC read for the active symbol. */
export const COPILOT = {
  ticker: "NVDA",
  exchange: "NASDAQ",
  timeframe: "15m",
  model: "Claude Sonnet",
  models: ["Claude Sonnet", "Claude Opus", "Claude Haiku"],
  bias: "Bullish",
  biasConfidence: 87,
  rows: [
    { label: "Liquidity", value: "Swept @ 478.20" },
    { label: "Order Block", value: "479.80 – 481.20" },
    { label: "Fair Value Gap", value: "481.50 – 483.10" },
  ],
  structure: "MSS · BOS confirmed",
};

/* AI-generated trade plan shown in Copilot + prefilled on the Trade screen. */
export const TRADE_PLAN = {
  entry: 482.40,
  stop: 478.80,
  tp1: 494.50,
  tp2: 502.20,
  rr: "1 : 3.2",
  confidence: 87,
};

/* Top-line portfolio figure for the mobile Dashboard (mockup 3). */
export const PORTFOLIO_TOTAL = { value: 2847392, change: 42183, pct: 1.51 };

/* Active positions for the Dashboard. up drives ▲/▼ + colour. */
export const POSITIONS = [
  { t: "NVDA", name: "NVIDIA Corp", entry: 480.20, pnl: 12840, pct: 2.63, up: true },
  { t: "SPY", name: "S&P 500 ETF", entry: 480.20, pnl: 12840, pct: 2.63, up: true },
  { t: "AAPL", name: "Apple Inc", entry: 480.20, pnl: -12840, pct: -2.63, up: false },
  { t: "BTC/USD", name: "Bitcoin", entry: 480.20, pnl: 12840, pct: 2.63, up: true },
];
