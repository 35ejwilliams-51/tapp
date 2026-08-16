import React, { useState, useEffect, useRef, useContext, createContext } from "react";

/*
  TAPP MARKET DATA LAYER — TAPP API gateway + controlled fallback
  ----------------------------------------------------------------
  The browser never receives or submits a market-data provider key.
  It polls the TAPP backend at /api/market/quotes. The backend owns provider
  credentials, normalization, session classification, and freshness policy.

  Important semantics:
  - Session-inactive instruments keep their last authoritative provider quote.
    They are NOT random-walked simply because their venue is closed.
  - Continuous instruments (for example BTC) remain freshness-checked 24/7.
  - Simulation is used only when the gateway is unconfigured/unavailable, or
    for prototype symbols not yet supplied by the gateway (EUR/USD today).
*/

const SEED = {
  NVDA: { price: 172.40, pct: 5.26 }, TSLA: { price: 248.10, pct: 2.14 },
  AAPL: { price: 229.87, pct: 0.61 }, AMD: { price: 164.32, pct: -1.38 },
  MSFT: { price: 441.05, pct: 0.92 }, META: { price: 512.30, pct: -0.44 },
  "EUR/USD": { price: 1.0842, pct: 0.22 }, SPY: { price: 548.0, pct: 0.41 },
  QQQ: { price: 478.0, pct: 0.78 }, GOOGL: { price: 178.0, pct: -0.32 },
  AMZN: { price: 198.0, pct: 1.12 }, COIN: { price: 245.0, pct: -2.05 },
  PLTR: { price: 38.0, pct: 3.44 }, BTC: { price: 67000, pct: 1.88 },
  GLD: { price: 215.0, pct: 0.15 },
};

const API_SYMBOLS = Object.keys(SEED).filter((s) => s !== "EUR/USD");
const CANDLE_MS = 6000;
const MAX_CANDLES = 40;
// Finnhub's prototype/free REST allowance is finite. Four full polls/minute keeps
// this single-Founder prototype below 60 quote requests/minute for 14 symbols.
const POLL_MS = 15000;

const LiveCtx = createContext(null);
export const useLive = () => useContext(LiveCtx);

export function LiveProvider({ children }) {
  const [status, setStatus] = useState("simulated"); // simulated | connecting | live | degraded | error
  const [meta, setMeta] = useState({
    provider: "tapp-gateway",
    freshness: "unknown",
    traceId: null,
    activeCount: 0,
    inactiveCount: 0,
    staleCount: 0,
    missingCount: 0,
  });
  const [, force] = useState(0);
  const dataRef = useRef(null);
  const candlesRef = useRef({});
  const liveSet = useRef(new Set());
  // Symbols in providerSet have authoritative provider data, even if their
  // session is inactive or their active feed is stale. They must not be
  // overwritten by the random-walk fallback.
  const providerSet = useRef(new Set());

  if (dataRef.current === null) {
    const init = {};
    for (const [tk, s] of Object.entries(SEED)) {
      const open = s.price / (1 + s.pct / 100);
      init[tk] = {
        price: s.price,
        open,
        spark: [open, s.price],
        dataState: "simulated",
        providerTimestamp: null,
        freshness: "unknown",
        sessionState: "unknown",
      };
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

  // Controlled simulation. Authoritative provider values are preserved when a
  // venue is session-inactive or an active feed is being isolated as stale.
  useEffect(() => {
    const id = setInterval(() => {
      for (const tk in dataRef.current) {
        if (providerSet.current.has(tk)) continue;
        const e = dataRef.current[tk];
        const vol = e.price > 5000 ? e.price * 0.0009 : e.price < 5 ? e.price * 0.0008 : e.price * 0.0014;
        push(
          tk,
          Math.max(0.0001, e.price + (Math.random() - 0.5) * vol * 2),
          { dataState: "simulated", freshness: "unknown", sessionState: "unknown" },
        );
      }
    }, 1100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (!cancelled) {
        // Do not flash a healthy/degraded banner back to "checking" on every
        // background poll. "connecting" is only for startup/recovery.
        setStatus((s) => (s === "live" || s === "degraded") ? s : "connecting");
      }

      try {
        const r = await fetch(
          `/api/market/quotes?symbols=${encodeURIComponent(API_SYMBOLS.join(','))}`,
          { headers: { accept: "application/json" } },
        );
        if (!r.ok) throw new Error(`market gateway ${r.status}`);

        const body = await r.json();
        if (cancelled) return;

        const quotes = Array.isArray(body.quotes) ? body.quotes : [];
        liveSet.current.clear();
        providerSet.current.clear();

        let staleActiveCount = 0;
        let activeCount = 0;
        let inactiveCount = 0;

        for (const q of quotes) {
          if (!q?.symbol || !(q.price > 0) || !dataRef.current[q.symbol]) continue;

          providerSet.current.add(q.symbol);
          if (q.previousClose > 0) dataRef.current[q.symbol].open = q.previousClose;

          const sessionState = q.sessionState || "active";
          const freshness = q.freshness || "unknown";
          const dataState = freshness === "session-inactive" ? "session-inactive" : (q.state || "live");

          push(q.symbol, q.price, {
            dataState,
            providerTimestamp: q.providerTimestamp || null,
            freshness,
            sessionState,
          });

          if (sessionState === "inactive" || freshness === "session-inactive") {
            inactiveCount += 1;
            continue;
          }

          activeCount += 1;
          if (freshness === "fresh" || freshness === "unknown") {
            liveSet.current.add(q.symbol);
          }
          if (freshness === "stale") staleActiveCount += 1;
        }

        const missingCount = Math.max(0, API_SYMBOLS.length - providerSet.current.size);

        const overallFreshness = staleActiveCount > 0 || missingCount > 0
          ? "stale"
          : activeCount > 0
            ? "fresh"
            : inactiveCount > 0
              ? "session-inactive"
              : "unknown";

        setMeta({
          provider: body.provider || "tapp-gateway",
          freshness: overallFreshness,
          traceId: body.traceId || null,
          activeCount,
          inactiveCount,
          staleCount: staleActiveCount,
          missingCount,
        });

        if (!body.configured) {
          // No authoritative provider data exists, so fallback simulation is
          // allowed for the prototype.
          providerSet.current.clear();
          setStatus("simulated");
        } else if (quotes.length === 0) {
          providerSet.current.clear();
          setStatus("degraded");
        } else if (staleActiveCount > 0 || missingCount > 0) {
          // Only active stale data or missing requested quotes degrade the
          // global feed. Session-inactive venues are normal and do not.
          setStatus("degraded");
        } else {
          setStatus("live");
        }
      } catch {
        if (!cancelled) {
          liveSet.current.clear();
          providerSet.current.clear();
          setStatus("error");
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
        freshness: e.freshness,
        sessionState: e.sessionState,
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
    simulated: { c: "var(--color-gold)", t: "Simulated fallback · TAPP gateway unconfigured" },
    connecting: { c: "var(--color-gold)", t: "Checking TAPP global data gateway…" },
    live: { c: "var(--color-cyan)", t: "Global feed online · session-aware" },
    degraded: { c: "var(--color-red)", t: "Market data degraded · active feed issue isolated" },
    error: { c: "var(--color-red)", t: "Gateway unavailable · simulated fallback" },
  }[status];

  const active = live?.meta?.activeCount || 0;
  const inactive = live?.meta?.inactiveCount || 0;
  const sessionSummary = status === "live" && inactive > 0
    ? ` · ${active} active / ${inactive} session inactive`
    : "";

  return (
    <div className="live-bar">
      <span className="live-status" aria-live="polite">
        <span className="live-dot" style={{ background: display.c, boxShadow: `0 0 6px ${display.c}` }} />
        {display.t}{sessionSummary}
      </span>
      <span className="live-status">Provider: {live?.meta?.provider || "tapp-gateway"}</span>
    </div>
  );
}
