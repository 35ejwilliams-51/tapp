import React from "react";
import { Radar } from "lucide-react";
import { Sparkline, CandleChart } from "./primitives.jsx";
import { ScannerHeroCard, SecondaryCard } from "./cards.jsx";
import { HERO, WATCH, WATCHLIST, HOLDINGS, CANDLES, ALERTS, TONE } from "../data.js";
import { useLive } from "../live.jsx";
import { useUI } from "./ticker.jsx";

export function PortfolioPanel() {
  return (
    <section className="panel" aria-label="Portfolio">
      <div className="panel-head"><span className="panel-title">Portfolio</span><span className="panel-sub">4 positions</span></div>
      <div className="panel-body">
        <div>
          <div className="pf-total">$62,167</div>
          <div className="pf-sub" style={{ color: "var(--color-cyan-ink)" }}>
            <span aria-hidden="true">▲</span> +$1,842 (3.05%) today
          </div>
        </div>
        <div className="pf-bar" aria-hidden="true">
          {HOLDINGS.map((h) => <span key={h.t} style={{ width: `${h.w}%`, background: h.color }} />)}
        </div>
        {HOLDINGS.map((h) => (
          <div className="holding" key={h.t}>
            <div className="h-l"><div className="t">{h.t}</div><div className="s">{h.s}</div></div>
            <div className="h-r">
              <div className="v">{h.v}</div>
              <div className="p" style={{ color: h.up ? "var(--color-cyan-ink)" : "var(--color-red-ink)" }}>
                <span aria-hidden="true">{h.up ? "▲" : "▼"}</span> {h.up ? "+" : ""}{h.p}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ScannerPanel({ full }) {
  return (
    <section className="panel" aria-label="Scanner">
      <div className="panel-head"><span className="panel-title">Scanner</span><span className="panel-sub">6 signals</span></div>
      <div className="panel-body">
        <ScannerHeroCard {...HERO} onReview={() => {}} />
        {(full ? WATCH : WATCH.slice(0, 4)).map((w) => <SecondaryCard key={w.ticker} {...w} />)}
      </div>
    </section>
  );
}

export function WatchlistPanel() {
  const live = useLive();
  const ui = useUI();
  return (
    <section className="panel" aria-label="Watchlist">
      <div className="panel-head"><span className="panel-title">Watchlist</span><span className="panel-sub">{WATCHLIST.length}</span></div>
      <div className="panel-body" style={{ gap: 2 }}>
        {WATCHLIST.map((w) => {
          const L = live?.get(w.ticker);
          const pct = L ? L.changePercent : w.changePercent;
          const up = pct >= 0;
          const spark = (L && L.spark) || (w.gold ? [20, 22, 21, 23, 24, 23, 25] : up ? [20, 22, 21, 24, 26, 25, 28] : [28, 27, 29, 26, 25, 24, 23]);
          return (
            <button className="wl-row" key={w.ticker} onClick={() => ui?.openTicker(w.ticker)} aria-label={`${w.ticker}, ${up ? "up" : "down"} ${Math.abs(pct).toFixed(2)}%`}>
              <span className="wl-t">{w.ticker}</span>
              <span className="wl-spark"><Sparkline data={spark} direction={w.gold ? "gold" : up ? "up" : "down"} height={22} /></span>
              <span className="wl-c" style={{ color: up ? "var(--color-cyan-ink)" : "var(--color-red-ink)" }}>
                <span aria-hidden="true">{up ? "▲" : "▼"}</span>{up ? "+" : ""}{pct.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ChartPanel() {
  const live = useLive();
  const L = live?.get("NVDA");
  const price = L ? L.price : 172.40;
  const pct = L ? L.changePercent : 5.26;
  const up = pct >= 0;
  const liveCandles = live?.getCandles("NVDA") || [];
  const candles = liveCandles.length >= 2 ? liveCandles : CANDLES;
  return (
    <section className="panel" aria-label="Chart">
      <div className="panel-head">
        <span className="panel-title">NVDA · 1D</span>
        <span className="panel-sub" style={{ color: up ? "var(--color-cyan-ink)" : "var(--color-red-ink)" }}>
          {up ? "▲ +" : "▼ "}{pct.toFixed(2)}%
        </span>
      </div>
      <div className="panel-body">
        <div className="chart-stat-row">
          <div className="chart-stat"><span className="k">PRICE</span><span className="v">${price.toFixed(2)}</span></div>
          <div className="chart-stat"><span className="k">DAY HIGH</span><span className="v">173.88</span></div>
          <div className="chart-stat"><span className="k">DAY LOW</span><span className="v">164.10</span></div>
          <div className="chart-stat"><span className="k">VOL</span><span className="v">42.6M</span></div>
        </div>
        <div style={{ flex: 1, minHeight: 180 }}><CandleChart candles={candles} /></div>
        <div className="tf-row">
          {["1H", "1D", "1W", "1M", "1Y"].map((t, i) => (
            <button key={t} className={`tf-btn ${i === 1 ? "active" : ""}`}>{t}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AlertsPanel() {
  return (
    <section className="panel" aria-label="Alerts">
      <div className="panel-head"><span className="panel-title">Alerts</span><span className="panel-sub">{ALERTS.length} new</span></div>
      <div className="panel-body">
        {ALERTS.map((a, i) => (
          <div className="alert-card" key={i}>
            <span className="alert-dot" style={{ background: TONE[a.tone], boxShadow: `0 0 6px ${TONE[a.tone]}` }} />
            <div className="alert-main">
              <div className="alert-title">{a.title}</div>
              <div className="alert-desc">{a.desc}</div>
              <div className="alert-time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Mobile single-column scanner view. */
export function ScannerScreen() {
  return (
    <div className="scanner-screen">
      <div className="section-label">Top opportunity</div>
      <ScannerHeroCard {...HERO} onReview={() => {}} />
      <div className="section-label">Watchlist signals</div>
      {WATCH.slice(0, 4).map((w) => <SecondaryCard key={w.ticker} {...w} />)}
    </div>
  );
}

export function Placeholder({ label }) {
  return (
    <div className="placeholder">
      <Radar size={28} aria-hidden="true" />
      <div>{label} screen</div>
      <div style={{ fontSize: 12 }}>Coming in a later phase.</div>
    </div>
  );
}
