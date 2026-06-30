import React, { useState, useEffect, useRef, useContext, createContext } from "react";

/*
  LIVE DATA LAYER — Finnhub WebSocket + simulated fallback
  --------------------------------------------------------
  • With a Finnhub API key: opens wss://ws.finnhub.io?token=KEY, subscribes to
    the displayed symbols, and updates prices from real trades.
    Free tier: 60 req/min, up to 50 symbols, 1 socket per key.
  • Without a key — or off market hours, or if a sandbox blocks the socket — a
    random-walk simulator keeps the UI moving so real-time behaviour is visible.
  • A key entered in the LiveBar lives only in React state. NOTE: a key supplied via
    VITE_FINNHUB_KEY is inlined into the client bundle and is publicly visible — move it
    behind a server proxy before production (see docs/SECURITY-REVIEW.md).

  To make day-change accurate in production, seed each symbol's `open` from the
  previous close via Finnhub's /quote REST endpoint instead of the static seed.
*/

// ticker -> { price, pct: opening %, fh: Finnhub symbol (omit = simulate only) }
const SEED = {
  NVDA: { price: 172.40, pct: 5.26, fh: "NVDA" },
  TSLA: { price: 248.10, pct: 2.14, fh: "TSLA" },
  AAPL: { price: 229.87, pct: 0.61, fh: "AAPL" },
  AMD:  { price: 164.32, pct: -1.38, fh: "AMD" },
  MSFT: { price: 441.05, pct: 0.92, fh: "MSFT" },
  META: { price: 512.30, pct: -0.44, fh: "META" },
  "EUR/USD": { price: 1.0842, pct: 0.22 },           // forex streaming varies; simulated here
  SPY:  { price: 548.0, pct: 0.41, fh: "SPY" },
  QQQ:  { price: 478.0, pct: 0.78, fh: "QQQ" },
  GOOGL:{ price: 178.0, pct: -0.32, fh: "GOOGL" },
  AMZN: { price: 198.0, pct: 1.12, fh: "AMZN" },
  COIN: { price: 245.0, pct: -2.05, fh: "COIN" },
  PLTR: { price: 38.0, pct: 3.44, fh: "PLTR" },
  BTC:  { price: 67000, pct: 1.88, fh: "BINANCE:BTCUSDT" },
  GLD:  { price: 215.0, pct: 0.15, fh: "GLD" },
};
const REVERSE = Object.fromEntries(
  Object.entries(SEED).filter(([, v]) => v.fh).map(([k, v]) => [v.fh, k])
);

// Live candles are aggregated from ticks into fixed time buckets.
// 6s here keeps the demo lively; use 60_000+ for real per-minute candles.
const CANDLE_MS = 6000;
const MAX_CANDLES = 40;

const LiveCtx = createContext(null);
export const useLive = () => useContext(LiveCtx);

export function LiveProvider({ children }) {
  const [status, setStatus] = useState("simulated"); // simulated | connecting | live | error
  const [, force] = useState(0);
  const dataRef = useRef(null);
  const candlesRef = useRef({});
  const liveSet = useRef(new Set());
  const wsRef = useRef(null);

  if (dataRef.current === null) {
    const init = {};
    for (const [tk, s] of Object.entries(SEED)) {
      const open = s.price / (1 + s.pct / 100);
      init[tk] = { price: s.price, open, spark: [open, s.price] };
    }
    dataRef.current = init;
  }

  // Update price + sparkline + the forming candle for a ticker.
  const push = (tk, p) => {
    const e = dataRef.current[tk];
    if (!e) return;
    e.price = p;
    e.spark.push(p);
    if (e.spark.length > 28) e.spark.shift();
    const arr = (candlesRef.current[tk] ||= []);
    const now = Date.now();
    const last = arr[arr.length - 1];
    if (!last || now - last.t >= CANDLE_MS) {
      arr.push({ o: p, h: p, l: p, c: p, t: now });
      if (arr.length > MAX_CANDLES) arr.shift();
    } else {
      last.c = p;
      if (p > last.h) last.h = p;
      if (p < last.l) last.l = p;
    }
  };

  // render flush ~3x/sec, decoupled from tick rate
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 350);
    return () => clearInterval(id);
  }, []);

  // simulator — random-walks every symbol NOT receiving real ticks
  useEffect(() => {
    const id = setInterval(() => {
      const d = dataRef.current;
      for (const tk in d) {
        if (liveSet.current.has(tk)) continue;
        const e = d[tk];
        const vol = e.price > 5000 ? e.price * 0.0009 : e.price < 5 ? e.price * 0.0008 : e.price * 0.0014;
        push(tk, Math.max(0.0001, e.price + (Math.random() - 0.5) * vol * 2));
      }
    }, 1100);
    return () => clearInterval(id);
  }, []);

  // Seed each symbol's open from the real previous close (/quote REST).
  // Free tier allows this; if blocked (CORS/sandbox) the seeded open is kept.
  const seedBaselines = (key) => {
    for (const [tk, s] of Object.entries(SEED)) {
      if (!s.fh) continue;
      fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(s.fh)}&token=${encodeURIComponent(key)}`)
        .then((r) => r.json())
        .then((q) => {
          if (!q || typeof q.pc !== "number" || q.pc <= 0) return;
          const e = dataRef.current[tk];
          e.open = q.pc;
          if (typeof q.c === "number" && q.c > 0) e.price = q.c;
          e.spark = [e.open, e.price];
          candlesRef.current[tk] = [];
        })
        .catch(() => { /* keep seeded open */ });
    }
  };

  const connect = (key) => {
    if (!key) return;
    setStatus("connecting");
    seedBaselines(key);
    try {
      const ws = new WebSocket(`wss://ws.finnhub.io?token=${encodeURIComponent(key)}`);
      wsRef.current = ws;
      ws.onopen = () => {
        setStatus("live");
        for (const tk in SEED) if (SEED[tk].fh) ws.send(JSON.stringify({ type: "subscribe", symbol: SEED[tk].fh }));
      };
      ws.onmessage = (ev) => {
        let m; try { m = JSON.parse(ev.data); } catch { return; }
        if (m.type !== "trade" || !Array.isArray(m.data)) return;
        for (const t of m.data) {
          const tk = REVERSE[t.s];
          if (!tk || !dataRef.current[tk]) continue;
          liveSet.current.add(tk);
          push(tk, t.p);
        }
      };
      ws.onerror = () => setStatus("error");
      ws.onclose = () => {
        if (wsRef.current === ws) {
          wsRef.current = null; liveSet.current.clear();
          setStatus((s) => (s === "error" ? "error" : "simulated"));
        }
      };
    } catch { setStatus("error"); }
  };

  const disconnect = () => {
    const ws = wsRef.current; wsRef.current = null; liveSet.current.clear();
    if (ws) { try { ws.close(); } catch { /* noop */ } }
    setStatus("simulated");
  };

  // Auto-connect if a Finnhub key is provided via env (VITE_FINNHUB_KEY).
  // Falls through to the manual key field + simulation when absent.
  useEffect(() => {
    let envKey;
    try { envKey = import.meta.env && import.meta.env.VITE_FINNHUB_KEY; } catch { envKey = undefined; }
    if (envKey) connect(String(envKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (wsRef.current) try { wsRef.current.close(); } catch { /* noop */ } }, []);

  const api = {
    status, connect, disconnect,
    get(ticker) {
      const e = dataRef.current[ticker];
      if (!e) return null;
      const change = e.price - e.open;
      return {
        price: e.price,
        change,
        changePercent: e.open ? (change / e.open) * 100 : 0,
        spark: e.spark.length > 1 ? e.spark : null,
        isLive: liveSet.current.has(ticker),
      };
    },
    getCandles(ticker) {
      return candlesRef.current[ticker] || [];
    },
  };
  return <LiveCtx.Provider value={api}>{children}</LiveCtx.Provider>;
}

export function LiveBar() {
  const live = useLive();
  const [key, setKey] = useState("");
  const status = live?.status || "simulated";
  const meta = {
    simulated: { c: "var(--color-gold)", t: "Simulated feed" },
    connecting: { c: "var(--color-gold)", t: "Connecting…" },
    live: { c: "var(--color-cyan)", t: "Live · Finnhub" },
    error: { c: "var(--color-red)", t: "Connection failed — simulating" },
  }[status] || { c: "var(--color-gold)", t: "Simulated feed" };
  const connected = status === "live" || status === "connecting";
  return (
    <div className="live-bar">
      <span className="live-status" aria-live="polite">
        <span className="live-dot" style={{ background: meta.c, boxShadow: `0 0 6px ${meta.c}` }} />
        {meta.t}
      </span>
      {connected ? (
        <button className="live-btn" onClick={() => live.disconnect()}>Disconnect</button>
      ) : (
        <>
          <input className="live-key" type="password" value={key} placeholder="Finnhub API key (optional)"
                 aria-label="Finnhub API key" onChange={(e) => setKey(e.target.value)} />
          <button className="live-btn" onClick={() => live.connect(key.trim())}>Go live</button>
        </>
      )}
    </div>
  );
}
