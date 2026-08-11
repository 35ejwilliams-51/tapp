import React, { useState, useEffect, useRef, useContext, createContext } from "react";

/*
  TAPP MARKET DATA LAYER — TAPP API gateway + simulated fallback
  -------------------------------------------------------------
  The browser never receives or submits a market-data provider key.
  It polls the TAPP backend at /api/market/quotes. The backend owns the
  provider credential, normalization, and freshness policy.

  If the backend is unconfigured/unavailable, the UI remains functional using
  the original deterministic-ish random-walk demonstration behavior, clearly
  labeled as Simulated.
*/

const SEED = {
  NVDA: { price: 172.40, pct: 5.26 }, TSLA: { price: 248.10, pct: 2.14 },
  AAPL: { price: 229.87, pct: 0.61 }, AMD: { price: 164.32, pct: -1.38 },
  MSFT: { price: 441.05, pct: 0.92 }, META: { price: 512.30, pct: -0.44 },
  "EUR/USD": { price: 1.0842, pct: 0.22 }, SPY: { price: 548.0, pct: 0.41 },
  QQQ: { price: 478.0, pct: 0.78 }, GOOGL:{ price: 178.0, pct: -0.32 },
  AMZN: { price: 198.0, pct: 1.12 }, COIN: { price: 245.0, pct: -2.05 },
  PLTR: { price: 38.0, pct: 3.44 }, BTC: { price: 67000, pct: 1.88 },
  GLD: { price: 215.0, pct: 0.15 },
};

const API_SYMBOLS = Object.keys(SEED).filter((s) => s !== "EUR/USD");
const CANDLE_MS = 6000;
const MAX_CANDLES = 40;
const POLL_MS = 5000;

const LiveCtx = createContext(null);
export const useLive = () => useContext(LiveCtx);

export function LiveProvider({ children }) {
  const [status, setStatus] = useState("simulated"); // simulated | connecting | live | degraded | error
  const [meta, setMeta] = useState({ provider: "tapp-gateway", freshness: "unknown", traceId: null });
  const [, force] = useState(0);
  const dataRef = useRef(null);
  const candlesRef = useRef({});
  const liveSet = useRef(new Set());

  if (dataRef.current === null) {
    const init = {};
    for (const [tk, s] of Object.entries(SEED)) {
      const open = s.price / (1 + s.pct / 100);
      init[tk] = { price: s.price, open, spark: [open, s.price], dataState: "simulated", providerTimestamp: null };
    }
    dataRef.current = init;
  }

  const push = (tk, p, extra = {}) => {
    const e = dataRef.current[tk];
    if (!e || !(p > 0)) return;
    e.price = p;
    Object.assign(e, extra);
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

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 350);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      for (const tk in dataRef.current) {
        if (liveSet.current.has(tk)) continue;
        const e = dataRef.current[tk];
        const vol = e.price > 5000 ? e.price * 0.0009 : e.price < 5 ? e.price * 0.0008 : e.price * 0.0014;
        push(tk, Math.max(0.0001, e.price + (Math.random() - 0.5) * vol * 2), { dataState: "simulated" });
      }
    }, 1100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      if (!cancelled) setStatus((s) => s === "live" ? s : "connecting");
      try {
        const r = await fetch(`/api/market/quotes?symbols=${encodeURIComponent(API_SYMBOLS.join(','))}`, { headers: { accept: "application/json" } });
        if (!r.ok) throw new Error(`market gateway ${r.status}`);
        const body = await r.json();
        if (cancelled) return;
        const quotes = Array.isArray(body.quotes) ? body.quotes : [];
        liveSet.current.clear();
        let stale = false;
        for (const q of quotes) {
          if (!q?.symbol || !(q.price > 0) || !dataRef.current[q.symbol]) continue;
          if (q.previousClose > 0) dataRef.current[q.symbol].open = q.previousClose;
          push(q.symbol, q.price, { dataState: q.state || "live", providerTimestamp: q.providerTimestamp || null });
          if (q.freshness === "fresh" || q.freshness === "unknown") liveSet.current.add(q.symbol);
          if (q.freshness === "stale") stale = true;
        }
        setMeta({ provider: body.provider || "tapp-gateway", freshness: stale ? "stale" : (quotes.length ? "fresh" : "unknown"), traceId: body.traceId || null });
        if (!body.configured || quotes.length === 0) setStatus("simulated");
        else if (stale) setStatus("degraded");
        else setStatus("live");
      } catch {
        if (!cancelled) {
          liveSet.current.clear();
          setStatus("error");
          setTimeout(() => { if (!cancelled) setStatus("simulated"); }, 1800);
        }
      }
    };
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const api = {
    status,
    meta,
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
        dataState: e.dataState,
        providerTimestamp: e.providerTimestamp,
      };
    },
    getCandles(ticker) { return candlesRef.current[ticker] || []; },
  };
  return <LiveCtx.Provider value={api}>{children}</LiveCtx.Provider>;
}

export function LiveBar() {
  const live = useLive();
  const status = live?.status || "simulated";
  const display = {
    simulated: { c: "var(--color-gold)", t: "Simulated feed · TAPP gateway unconfigured" },
    connecting: { c: "var(--color-gold)", t: "Checking TAPP data gateway…" },
    live: { c: "var(--color-cyan)", t: "Live · TAPP Data Gateway" },
    degraded: { c: "var(--color-red)", t: "Market data degraded · stale feed isolated" },
    error: { c: "var(--color-red)", t: "Gateway unavailable · simulated fallback" },
  }[status];
  return (
    <div className="live-bar">
      <span className="live-status" aria-live="polite">
        <span className="live-dot" style={{ background: display.c, boxShadow: `0 0 6px ${display.c}` }} />
        {display.t}
      </span>
      <span className="live-status">Provider: {live?.meta?.provider || "tapp-gateway"}</span>
    </div>
  );
}
