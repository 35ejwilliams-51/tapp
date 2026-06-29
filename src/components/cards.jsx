import React from "react";
import { Sparkline } from "./primitives.jsx";
import { useLive } from "../live.jsx";
import { useUI } from "./ticker.jsx";

/* Part 5 — ScannerHeroCard. Direction shown by ▲/▼ + sign, never colour alone. */
export function ScannerHeroCard({ ticker, name, price, change, changePercent, confidence, signal, spark, onReview }) {
  const L = useLive()?.get(ticker);
  const ui = useUI();
  const open = () => (ui ? ui.openTicker(ticker) : onReview && onReview());
  const p = L ? L.price : price;
  const ch = L ? L.change : change;
  const pct = L ? L.changePercent : changePercent;
  const sp = (L && L.spark) || spark;
  const up = ch >= 0;
  return (
    <div className="card-hero" aria-label={`Top opportunity ${ticker}`}>
      <div className="card-header">
        <div>
          <h2 className="ticker-text">{ticker}</h2>
          {name ? <div className="ticker-name">{name}</div> : null}
        </div>
        <div className="confidence-badge"><span className="confidence-value">{confidence}%</span></div>
      </div>

      <div className="price-section">
        <p className="price-current">${p.toFixed(2)}</p>
        <div className={`price-change ${up ? "positive" : "negative"}`}>
          <span className="change-arrow" aria-hidden="true">{up ? "▲" : "▼"}</span>
          <span className="change-value">{up ? "+" : ""}{ch.toFixed(2)}</span>
          <span className="change-percent">({up ? "+" : ""}{pct.toFixed(2)}%)</span>
        </div>
      </div>

      <div className="signal-badge"><span className="signal-label">{signal}</span></div>
      <div className="sparkline"><Sparkline data={sp} direction={up ? "up" : "down"} /></div>
      <button className="btn btn-primary" onClick={open}>Review trade</button>
    </div>
  );
}

/* Compact secondary opportunity row. */
export function SecondaryCard({ ticker, name, price, changePercent, gold }) {
  const L = useLive()?.get(ticker);
  const ui = useUI();
  const dec = ticker.includes("/") ? 4 : 2;
  const shownPrice = L ? L.price.toFixed(dec) : price;
  const pct = L ? L.changePercent : changePercent;
  const up = pct >= 0;
  const spark = (L && L.spark) || (gold
    ? [20, 22, 21, 24, 23, 25, 24, 26, 27]
    : up
      ? [20, 22, 21, 24, 26, 25, 28, 27, 30]
      : [30, 29, 31, 28, 27, 25, 26, 24, 23]);
  return (
    <button className="card-secondary" onClick={() => ui?.openTicker(ticker)} aria-label={`${ticker}, ${up ? "up" : "down"} ${Math.abs(pct).toFixed(2)}%`}>
      <div className="row-id"><div className="row-ticker">{ticker}</div><div className="row-name">{name}</div></div>
      <div className="row-spark"><Sparkline data={spark} direction={gold ? "gold" : up ? "up" : "down"} height={30} /></div>
      <div className="row-right">
        <div className="row-price">{shownPrice}</div>
        <div className={`row-change ${up ? "positive" : "negative"}`}>
          <span aria-hidden="true">{up ? "▲" : "▼"}</span>{up ? "+" : ""}{pct.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}
