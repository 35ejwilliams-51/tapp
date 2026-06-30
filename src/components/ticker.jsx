import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { ChevronLeft, X, Check } from "lucide-react";
import { CandleChart } from "./primitives.jsx";
import { useLive } from "../live.jsx";
import { useDialog } from "../hooks.js";

const NAMES = {
  NVDA: "NVIDIA Corp", TSLA: "Tesla", AAPL: "Apple", AMD: "Advanced Micro Devices",
  MSFT: "Microsoft", META: "Meta Platforms", "EUR/USD": "Euro / US Dollar",
  SPY: "S&P 500 ETF", QQQ: "Invesco QQQ", GOOGL: "Alphabet", AMZN: "Amazon",
  COIN: "Coinbase", PLTR: "Palantir", BTC: "Bitcoin", GLD: "SPDR Gold Trust",
};

/* ---------------- UI navigation context ---------------- */
const UICtx = createContext(null);
export const useUI = () => useContext(UICtx);

export function UIProvider({ children }) {
  const [selected, setSelected] = useState(null); // ticker | null
  const [ticket, setTicket] = useState(null);     // { ticker, side } | null
  const triggerRef = useRef(null);

  // Centralised Escape: closes the topmost layer (ticket before detail).
  useEffect(() => {
    if (!selected && !ticket) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (ticket) setTicket(null);
      else setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, ticket]);

  const api = {
    selected, ticket,
    openTicker: (t) => { triggerRef.current = document.activeElement; setSelected(t); },
    closeTicker: () => {
      setSelected(null);
      const el = triggerRef.current;
      if (el && el.focus) setTimeout(() => el.focus(), 0);
    },
    openTicket: (ticker, side) => setTicket({ ticker, side }),
    closeTicket: () => setTicket(null),
  };
  return (
    <UICtx.Provider value={api}>
      {children}
      <TickerDetail />
      <OrderTicket />
    </UICtx.Provider>
  );
}

/* ---------------- helpers ---------------- */
const dec = (t) => (t.includes("/") ? 4 : 2);
const fmt = (n, t) => n.toLocaleString(undefined, { minimumFractionDigits: dec(t), maximumFractionDigits: dec(t) });

function candlesFor(live, ticker) {
  const c = live?.getCandles(ticker) || [];
  if (c.length >= 2) return c;
  const sp = live?.get(ticker)?.spark;
  if (sp && sp.length >= 2) {
    const out = [];
    for (let i = 1; i < sp.length; i++) {
      const o = sp[i - 1], cl = sp[i];
      const pad = Math.abs(cl - o) * 0.4 + Math.abs(o) * 0.0005;
      out.push({ o, c: cl, h: Math.max(o, cl) + pad, l: Math.min(o, cl) - pad });
    }
    return out;
  }
  return [];
}

/* ---------------- Ticker detail overlay ---------------- */
function TickerDetail() {
  const ui = useUI();
  const live = useLive();
  const [tf, setTf] = useState("1D");
  const ticker = ui?.selected;
  const dialogRef = useDialog(!!ticker && !ui?.ticket);
  if (!ticker) return null;

  const L = live?.get(ticker);
  const price = L ? L.price : 0;
  const change = L ? L.change : 0;
  const pct = L ? L.changePercent : 0;
  const up = change >= 0;
  const candles = candlesFor(live, ticker);
  const highs = candles.map((c) => c.h), lows = candles.map((c) => c.l);
  const dayHigh = highs.length ? Math.max(...highs) : price;
  const dayLow = lows.length ? Math.min(...lows) : price;
  const open = price - change;
  const conf = Math.min(96, 68 + Math.round(Math.abs(pct) * 4));
  const signal = up ? "AI Signal · Bullish momentum" : "AI Signal · Bearish pressure";

  return (
    <div className="tk-overlay" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${ticker} details`}>
      <div className="tk-head">
        <button className="tk-back" aria-label="Back" onClick={ui.closeTicker}><ChevronLeft size={20} /></button>
        <div className="tk-head-main">
          <div className="tk-tk">{ticker}</div>
          <div className="tk-nm">{NAMES[ticker] || ticker}</div>
        </div>
        <div className="tk-head-price">
          <div className="tk-price">{price ? fmt(price, ticker) : "—"}</div>
          <div className="tk-chg" style={{ color: up ? "var(--color-cyan-ink)" : "var(--color-red-ink)" }}>
            <span aria-hidden="true">{up ? "▲" : "▼"}</span>{up ? "+" : ""}{change.toFixed(dec(ticker))} ({up ? "+" : ""}{pct.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="tk-body">
        <div className="tk-chart">
          {candles.length >= 2 ? <CandleChart candles={candles} /> : <div className="placeholder" style={{ minHeight: 0, height: "100%" }}>Building chart…</div>}
        </div>

        <div className="tf-row" role="group" aria-label="Timeframe">
          {["1H", "1D", "1W", "1M", "1Y"].map((t) => (
            <button key={t} className={`tf-btn ${tf === t ? "active" : ""}`} onClick={() => setTf(t)} title="Session view (demo)">{t}</button>
          ))}
        </div>

        <div className="tk-stats">
          <div className="tk-stat"><div className="k">OPEN</div><div className="v">{fmt(open, ticker)}</div></div>
          <div className="tk-stat"><div className="k">DAY HIGH</div><div className="v">{fmt(dayHigh, ticker)}</div></div>
          <div className="tk-stat"><div className="k">DAY LOW</div><div className="v">{fmt(dayLow, ticker)}</div></div>
          <div className="tk-stat"><div className="k">PREV CLOSE</div><div className="v">{fmt(open, ticker)}</div></div>
          <div className="tk-stat"><div className="k">VOLUME</div><div className="v">42.6M</div></div>
          <div className="tk-stat"><div className="k">DAY RANGE</div><div className="v">{(dayHigh - dayLow).toFixed(dec(ticker))}</div></div>
        </div>

        <div className="glass-card tk-signal">
          <div>
            <div className="signal-label" style={{ fontSize: 14 }}>{signal}</div>
            <div className="set-sub" style={{ marginTop: 4 }}>Confidence {conf}% · Setup {up ? "Breakout" : "Reversal watch"}</div>
          </div>
          <div className="confidence-badge"><span className="confidence-value">{conf}%</span></div>
        </div>

        <div className="tk-actions">
          <button className="btn-sell" onClick={() => ui.openTicket(ticker, "sell")}>Sell</button>
          <button className="btn-buy" onClick={() => ui.openTicket(ticker, "buy")}>Buy</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Order ticket modal ---------------- */
function OrderTicket() {
  const ui = useUI();
  const live = useLive();
  const ticket = ui?.ticket;
  const dialogRef = useDialog(!!ticket);
  const [side, setSide] = useState("buy");
  const [qty, setQty] = useState("10");
  const [type, setType] = useState("market");
  const [limit, setLimit] = useState("");
  const [done, setDone] = useState(false);

  // sync side when a new ticket opens
  React.useEffect(() => {
    if (ticket) { setSide(ticket.side); setDone(false); setQty("10"); setType("market"); setLimit(""); }
  }, [ticket]);

  if (!ticket) return null;
  const ticker = ticket.ticker;
  const L = live?.get(ticker);
  const price = type === "limit" && Number(limit) > 0 ? Number(limit) : (L ? L.price : 0);
  const q = Math.max(0, Number(qty) || 0);
  const est = q * price;
  const valid = q > 0 && price > 0 && (type === "market" || Number(limit) > 0);

  const close = () => ui.closeTicket();

  return (
    <div className="tk-modal-bg" onClick={close}>
      <div className="tk-sheet" ref={dialogRef} tabIndex={-1} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Order ticket">
        {done ? (
          <div className="ok">
            <div className="ok-badge"><Check size={28} /></div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Order placed</div>
            <div className="set-sub">
              {side === "buy" ? "Bought" : "Sold"} {q} {ticker} · est. ${est.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={close}>Done</button>
          </div>
        ) : (
          <>
            <div className="sheet-h">
              <div className="sheet-title">{ticker} · {NAMES[ticker] || ""}</div>
              <button className="sheet-x" aria-label="Close" onClick={close}><X size={20} /></button>
            </div>

            <div className="seg" role="radiogroup" aria-label="Side">
              <button role="radio" aria-checked={side === "buy"} className={side === "buy" ? "active" : ""} onClick={() => setSide("buy")}>Buy</button>
              <button role="radio" aria-checked={side === "sell"} className={side === "sell" ? "active" : ""} onClick={() => setSide("sell")}>Sell</button>
            </div>

            <div className="field">
              <label htmlFor="ot-qty">Quantity</label>
              <input id="ot-qty" className="input-text" type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>

            <div className="seg" role="radiogroup" aria-label="Order type">
              <button role="radio" aria-checked={type === "market"} className={type === "market" ? "active" : ""} onClick={() => setType("market")}>Market</button>
              <button role="radio" aria-checked={type === "limit"} className={type === "limit" ? "active" : ""} onClick={() => setType("limit")}>Limit</button>
            </div>

            {type === "limit" && (
              <div className="field">
                <label htmlFor="ot-limit">Limit price</label>
                <input id="ot-limit" className="input-text" type="number" min="0" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder={L ? fmt(L.price, ticker) : ""} />
              </div>
            )}

            <div className="est">
              <span className="k">Estimated {side === "buy" ? "cost" : "credit"}</span>
              <span className="v">${est.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>

            <button className={side === "buy" ? "btn-buy" : "btn-sell"} disabled={!valid}
                    style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                    onClick={() => valid && setDone(true)}>
              {side === "buy" ? "Place buy order" : "Place sell order"}
            </button>
            <div className="set-sub" style={{ textAlign: "center" }}>Simulated order — not a real trade.</div>
          </>
        )}
      </div>
    </div>
  );
}
