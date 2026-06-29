import React, { useState } from "react";
import { Sparkles, ChevronDown, Check, Bell, Zap } from "lucide-react";
import { CandleChart, Sparkline } from "./primitives.jsx";
import { COPILOT, TRADE_PLAN, CANDLES } from "../data.js";
import { useLive } from "../live.jsx";
import { useUI } from "./ticker.jsx";

/* Shared: pull live price/candles for a symbol, fall back to seed/mock. */
function useSymbol(ticker) {
  const live = useLive();
  const L = live?.get(ticker);
  const liveCandles = live?.getCandles(ticker) || [];
  return {
    price: L ? L.price : 485.92,
    pct: L ? L.changePercent : 2.63,
    candles: liveCandles.length >= 2 ? liveCandles : CANDLES,
  };
}

/* ---------------- Trade plan card (inside Copilot) ---------------- */
function TradePlanCard() {
  const P = TRADE_PLAN;
  const cells = [
    { k: "Entry", v: P.entry.toFixed(2), tone: "" },
    { k: "Stop", v: P.stop.toFixed(2), tone: "neg" },
    { k: "TP1", v: P.tp1.toFixed(2), tone: "pos" },
    { k: "TP2", v: P.tp2.toFixed(2), tone: "pos" },
  ];
  return (
    <div className="cp-plan">
      <div className="cp-plan-head">Trade Plan</div>
      <div className="cp-plan-grid">
        {cells.map((c) => (
          <div className="cp-plan-cell" key={c.k}>
            <span className="cp-k">{c.k}</span>
            <span className={`cp-v ${c.tone}`}>{c.v}</span>
          </div>
        ))}
      </div>
      <div className="cp-plan-foot">
        <div className="cp-plan-cell"><span className="cp-k">R:R</span><span className="cp-v">{P.rr}</span></div>
        <div className="cp-plan-cell">
          <span className="cp-k">Confidence</span>
          <span className="cp-v" style={{ color: "var(--color-cyan-ink)" }}>{P.confidence}%</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- TAPP Copilot side panel ---------------- */
export function CopilotPanel({ actions }) {
  const [model, setModel] = useState(COPILOT.model);
  const ui = useUI();
  const acts = actions || [
    { label: "Analyze Chart", icon: Sparkles, onClick: () => {} },
    { label: "Create Trade Plan", icon: Zap, primary: true, onClick: () => ui?.openTicket(COPILOT.ticker, "buy") },
  ];
  return (
    <aside className="copilot" aria-label="TAPP Copilot">
      <div className="cp-head">
        <span className="cp-spark" aria-hidden="true"><Sparkles size={16} /></span>
        <span className="cp-title">TAPP Copilot</span>
      </div>

      <div className="cp-body">
        <div className="cp-field">
          <span className="cp-field-k">Model</span>
          <div className="cp-select">
            <select value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model">
              {COPILOT.models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </div>
        </div>

        <div className="cp-context">
          <span className="cp-ctx-k">Context</span>
          <span className="cp-chip">{COPILOT.ticker}</span>
          <span className="cp-chip">{COPILOT.timeframe}</span>
          <span className="cp-chip">Watchlist</span>
        </div>

        <div className="cp-bias">
          <div className="cp-bias-top">
            <span className="cp-bias-label">Market Bias</span>
            <span className="cp-bias-val">{COPILOT.bias}</span>
          </div>
          <div className="cp-bias-bar" role="meter" aria-valuenow={COPILOT.biasConfidence} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${COPILOT.biasConfidence}%` }} />
          </div>
          <div className="cp-bias-pct">{COPILOT.biasConfidence}% confidence</div>
        </div>

        {COPILOT.rows.map((r) => (
          <div className="cp-row" key={r.label}>
            <span className="cp-row-k">{r.label}</span>
            <span className="cp-row-v">{r.value}</span>
          </div>
        ))}

        <div className="cp-confirm">
          <span className="cp-check" aria-hidden="true"><Check size={14} /></span>
          <span>{COPILOT.structure}</span>
        </div>

        <TradePlanCard />

        <div className="cp-actions">
          {acts.map(({ label, icon: Icon, primary, onClick }) => (
            <button key={label} className={`cp-btn ${primary ? "cp-btn-primary" : ""}`} onClick={onClick}>
              {Icon ? <Icon size={15} aria-hidden="true" /> : null}{label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Analyze chart column (toolbar + candles) ---------------- */
function AnalyzeChart() {
  const { price, pct, candles } = useSymbol(COPILOT.ticker);
  const up = pct >= 0;
  const [tf, setTf] = useState(COPILOT.timeframe);
  const tools = ["Indicators", "Layout", "Save"];
  return (
    <section className="az-chart" aria-label={`${COPILOT.ticker} chart`}>
      <div className="az-toolbar">
        <div className="az-id">
          <span className="az-sym">{COPILOT.ticker}</span>
          <span className="az-name">NVIDIA · {COPILOT.exchange}</span>
        </div>
        <div className="az-price">
          <span className="az-px">${price.toFixed(2)}</span>
          <span className="az-chg" style={{ color: up ? "var(--color-cyan-ink)" : "var(--color-red-ink)" }}>
            <span aria-hidden="true">{up ? "▲" : "▼"}</span> {up ? "+" : ""}{pct.toFixed(2)}%
          </span>
        </div>
        <div className="az-tools">
          {tools.map((t) => <button className="az-tool" key={t}>{t}</button>)}
          <button className="az-tool az-tool-ai"><Sparkles size={13} aria-hidden="true" /> AI Analyze</button>
        </div>
      </div>

      <div className="az-tfs" role="group" aria-label="Timeframe">
        {["1m", "5m", "15m", "1H", "4H", "1D"].map((t) => (
          <button key={t} className={`tf-btn ${tf === t ? "active" : ""}`} onClick={() => setTf(t)}>{t}</button>
        ))}
      </div>

      <div className="az-area"><CandleChart candles={candles} /></div>

      <div className="az-legend">
        <span><i className="dot ob" /> Order Block</span>
        <span><i className="dot fvg" /> Fair Value Gap</span>
        <span><i className="dot mss" /> MSS · BOS</span>
        <span><i className="dot liq" /> Liquidity</span>
      </div>
    </section>
  );
}

/* ---------------- Analyze: desktop (chart + copilot) ---------------- */
export function AnalyzeLayout() {
  return (
    <div className="analyze-layout">
      <AnalyzeChart />
      <CopilotPanel />
    </div>
  );
}

/* ---------------- Analyze: mobile (stacked) ---------------- */
export function AnalyzeScreen() {
  const ui = useUI();
  const actions = [
    { label: "Set Alert", icon: Bell, onClick: () => {} },
    { label: "Execute Trade", icon: Zap, primary: true, onClick: () => ui?.openTicket(COPILOT.ticker, "buy") },
  ];
  return (
    <div className="screen analyze-mobile">
      <AnalyzeChart />
      <CopilotPanel actions={actions} />
    </div>
  );
}

/* ---------------- Trade screen (mockup 5) ---------------- */
export function TradeScreen() {
  const { price, pct } = useSymbol(COPILOT.ticker);
  const up = pct >= 0;
  const P = TRADE_PLAN;
  const [side, setSide] = useState("buy");
  const [type, setType] = useState("Limit");
  const [qty, setQty] = useState("100");
  const [limit, setLimit] = useState(P.entry.toFixed(2));
  const [stop, setStop] = useState(P.stop.toFixed(2));
  const [tp, setTp] = useState(P.tp1.toFixed(2));
  const [stage, setStage] = useState("form"); // form | review | placed

  const q = Math.max(0, Number(qty) || 0);
  const px = type === "Market" ? price : Number(limit) || price;
  const est = q * px;
  const money = (n) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  if (stage === "placed") {
    return (
      <div className="screen trade-screen">
        <div className="trade-ok">
          <div className="ok-badge"><Check size={28} /></div>
          <div className="trade-ok-title">Order confirmed</div>
          <div className="set-sub">
            {side === "buy" ? "Buy" : "Sell"} {q} {COPILOT.ticker} · {type} @ ${money(px)} · est. ${money(est)}
          </div>
          <button className="cp-btn cp-btn-primary" style={{ marginTop: 12 }} onClick={() => setStage("form")}>New order</button>
          <div className="set-sub" style={{ textAlign: "center" }}>Simulated order — not a real trade.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen trade-screen">
      <div className="trade-ticker">
        <div className="tt-l">
          <div className="tt-sym">{COPILOT.ticker}</div>
          <div className="tt-px">
            ${price.toFixed(2)}
            <span className="tt-chg" style={{ color: up ? "var(--color-cyan-ink)" : "var(--color-red-ink)" }}>
              {up ? "+" : ""}{pct.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="tt-spark"><Sparkline data={[20, 22, 21, 24, 23, 26, 25, 28, 27, 30]} direction={up ? "up" : "down"} height={40} /></div>
      </div>

      <div className="seg seg-lg" role="tablist" aria-label="Side">
        <button role="tab" aria-selected={side === "buy"} className={`buy ${side === "buy" ? "active" : ""}`} onClick={() => setSide("buy")}>Buy</button>
        <button role="tab" aria-selected={side === "sell"} className={`sell ${side === "sell" ? "active" : ""}`} onClick={() => setSide("sell")}>Sell</button>
      </div>

      <div className="trade-form">
        <div className="tf-field">
          <span className="tf-k">Order Type</span>
          <div className="cp-select tf-select">
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Order type">
              {["Limit", "Market", "Stop"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </div>
        </div>
        <div className="tf-field">
          <span className="tf-k">Quantity</span>
          <input className="tf-input" type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} aria-label="Quantity" />
        </div>
        {type !== "Market" && (
          <div className="tf-field">
            <span className="tf-k">Limit Price</span>
            <input className="tf-input lg" type="number" min="0" value={limit} onChange={(e) => setLimit(e.target.value)} aria-label="Limit price" />
          </div>
        )}
        <div className="tf-pair">
          <div className="tf-field">
            <span className="tf-k">Stop Loss</span>
            <input className="tf-input ghost" type="number" min="0" value={stop} onChange={(e) => setStop(e.target.value)} aria-label="Stop loss" />
          </div>
          <div className="tf-field">
            <span className="tf-k">Take Profit</span>
            <input className="tf-input ghost" type="number" min="0" value={tp} onChange={(e) => setTp(e.target.value)} aria-label="Take profit" />
          </div>
        </div>
      </div>

      <div className="trade-rec">
        <div className="tr-head"><Sparkles size={15} aria-hidden="true" /> TAPP Recommends</div>
        <div className="tr-line">
          Entry <b>{P.entry.toFixed(2)}</b> · SL <b>{P.stop.toFixed(2)}</b> · TP1 <b>{P.tp1.toFixed(2)}</b> · TP2 <b>{P.tp2.toFixed(2)}</b>
        </div>
        <div className="tr-meta">R:R <b>{P.rr}</b> · Confidence <b>{P.confidence}%</b></div>
        <div className="tr-bar"><span style={{ width: `${P.confidence}%` }} /></div>
      </div>

      <div className="trade-est">
        <span className="cp-k">Estimated {side === "buy" ? "cost" : "credit"}</span>
        <span className="cp-v">${money(est)}</span>
      </div>

      {stage === "form" ? (
        <button className="btn-review" onClick={() => setStage("review")}>Review Order</button>
      ) : (
        <>
          <button className="btn-review" onClick={() => setStage("form")}>Edit Order</button>
          <button className="btn-confirm" onClick={() => setStage("placed")}>Confirm Order</button>
        </>
      )}
    </div>
  );
}
