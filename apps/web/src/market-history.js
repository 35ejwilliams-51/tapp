import React from "react";

const SAFE_STOCK_SYMBOL = /^[A-Z][A-Z0-9.-]{0,9}$/;

const CACHE = new Map();
const TTL = {
  "1H": 30_000,
  "1D": 60_000,
  "1W": 120_000,
  "1M": 300_000,
  "1Y": 900_000,
};

export const supportsMarketHistory = (ticker) => SAFE_STOCK_SYMBOL.test(String(ticker || "").toUpperCase()) && ticker !== "BTC";

export function useMarketHistory(ticker, timeframe) {
  const supported = supportsMarketHistory(ticker);
  const [result, setResult] = React.useState({
    status: supported ? "idle" : "unsupported",
    candles: [],
    provider: null,
    error: null,
  });

  React.useEffect(() => {
    if (!ticker || !supported) {
      setResult({ status: "unsupported", candles: [], provider: null, error: null });
      return undefined;
    }

    const key = `${ticker}:${timeframe}`;
    const cached = CACHE.get(key);
    const ttl = TTL[timeframe] || 60_000;
    if (cached && Date.now() - cached.at < ttl) {
      setResult({ status: "ready", candles: cached.candles, provider: cached.provider, error: null });
      return undefined;
    }

    const controller = new AbortController();
    setResult((prev) => ({ ...prev, status: "loading", candles: cached?.candles || [], error: null }));

    fetch(`/api/market-candles?symbol=${encodeURIComponent(ticker)}&timeframe=${encodeURIComponent(timeframe)}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body?.state || `history gateway ${r.status}`);
        if (!body.configured) {
          setResult({ status: "unconfigured", candles: [], provider: body.provider || "massive", error: null });
          return;
        }
        const candles = Array.isArray(body.candles) ? body.candles : [];
        if (!candles.length) {
          setResult({ status: "empty", candles: [], provider: body.provider || "massive", error: null });
          return;
        }
        const provider = body.provider || "massive";
        CACHE.set(key, { at: Date.now(), candles, provider });
        setResult({ status: "ready", candles, provider, error: null });
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setResult({ status: "error", candles: cached?.candles || [], provider: cached?.provider || "massive", error: String(err?.message || err) });
      });

    return () => controller.abort();
  }, [ticker, timeframe, supported]);

  return { ...result, supported };
}
