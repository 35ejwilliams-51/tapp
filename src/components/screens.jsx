import React, { useState } from "react";
import { ChevronRight, CreditCard, Link2, Shield, LifeBuoy } from "lucide-react";
import { Toggle, Sparkline } from "./primitives.jsx";
import { ScannerHeroCard } from "./cards.jsx";
import { HERO, ALERTS, TONE, PORTFOLIO_TOTAL, POSITIONS } from "../data.js";
import { useLive } from "../live.jsx";
import { useUI } from "./ticker.jsx";

/* ---------------- Home ---------------- */
export function HomeScreen({ user }) {
  const live = useLive();
  const ui = useUI();
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const first = (user?.name || "there").split(" ")[0];
  const indices = [{ n: "S&P 500", s: "SPY" }, { n: "Nasdaq", s: "QQQ" }, { n: "Bitcoin", s: "BTC" }];
  const PT = PORTFOLIO_TOTAL;
  return (
    <div className="screen">
      <div className="greeting">
        <h1>{greet}, {first}</h1>
        <p>Here's your market snapshot.</p>
      </div>

      <div className="glass-card home-summary">
        <span className="set-sub">Portfolio value</span>
        <span className="home-total">${PT.value.toLocaleString()}</span>
        <span className="pf-sub" style={{ color: PT.change >= 0 ? "var(--color-cyan-ink)" : "var(--color-red-ink)" }}>
          <span aria-hidden="true">{PT.change >= 0 ? "▲" : "▼"}</span> {PT.change >= 0 ? "+" : "−"}${Math.abs(PT.change).toLocaleString()} ({PT.pct >= 0 ? "+" : ""}{PT.pct.toFixed(2)}%) today
        </span>
      </div>

      <div className="section-label">Active positions</div>
      <div className="pos-list">
        {POSITIONS.map((p) => {
          const dir = p.up ? "up" : "down";
          const spark = p.up ? [18, 20, 19, 22, 24, 23, 26, 28] : [28, 26, 27, 24, 23, 22, 20, 19];
          return (
            <button className="pos-card" key={p.t} onClick={() => ui?.openTicker(p.t.split("/")[0])} aria-label={`${p.t} position`}>
              <div className="pos-l">
                <div className="pos-t">{p.t}</div>
                <div className="pos-n">{p.name}</div>
              </div>
              <div className="pos-spark"><Sparkline data={spark} direction={dir} height={34} /></div>
              <div className="pos-mid">
                <div className="pos-k">Entry</div>
                <div className="pos-entry">{p.entry.toFixed(2)}</div>
              </div>
              <div className="pos-r">
                <div className="pos-k">P&amp;L</div>
                <div className="pos-pnl" style={{ color: p.up ? "var(--color-cyan-ink)" : "var(--color-red-ink)" }}>
                  {p.pnl >= 0 ? "+" : "−"}${Math.abs(p.pnl).toLocaleString()}
                </div>
                <div className="pos-pct" style={{ color: p.up ? "var(--color-cyan-ink)" : "var(--color-red-ink)" }}>
                  {p.up ? "+" : ""}{p.pct.toFixed(2)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="idx-row">
        {indices.map((ix) => {
          const L = live?.get(ix.s);
          const pct = L ? L.changePercent : 0;
          const up = pct >= 0;
          const price = L ? L.price : null;
          return (
            <div className="idx-chip" key={ix.s}>
              <div className="idx-name">{ix.n}</div>
              <div className="idx-val">
                {price != null ? (ix.s === "BTC" ? `$${Math.round(price).toLocaleString()}` : price.toFixed(2)) : "—"}
              </div>
              <div className="idx-chg" style={{ color: up ? "var(--color-cyan-ink)" : "var(--color-red-ink)" }}>
                <span aria-hidden="true">{up ? "▲" : "▼"}</span>{up ? "+" : ""}{pct.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-label">Top opportunity</div>
      <ScannerHeroCard {...HERO} onReview={() => {}} />

      <div className="section-label">Recent alerts</div>
      {ALERTS.slice(0, 3).map((a, i) => (
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
  );
}

/* ---------------- Profile ---------------- */
export function ProfileScreen({ user, onSignOut, light, setLight }) {
  const [notif, setNotif] = useState(true);
  const [rtAlerts, setRtAlerts] = useState(true);
  const [bio, setBio] = useState(false);
  const name = user?.name || "Alex Morgan";
  const email = user?.email || "alex.morgan@example.com";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const accountRows = [
    { icon: CreditCard, label: "Subscription & billing" },
    { icon: Link2, label: "Linked brokers" },
    { icon: Shield, label: "Security & 2FA" },
    { icon: LifeBuoy, label: "Help & support" },
  ];
  return (
    <div className="screen">
      <div className="glass-card pf-head">
        <div className="pf-avatar" aria-hidden="true">{initials}</div>
        <div>
          <div className="pf-name">{name}</div>
          <div className="pf-email">{email}</div>
          <span className="pf-plan-badge">Institutional</span>
        </div>
      </div>

      <div className="glass-card plan-card">
        <div>
          <div className="plan-name">Institutional plan</div>
          <div className="plan-price">$49 / month · renews Jul 24</div>
        </div>
        <button className="live-btn">Manage</button>
      </div>

      <div className="section-label">Preferences</div>
      <div className="glass-card set-card">
        <div className="set-row">
          <div><div className="set-label">Light mode</div><div className="set-sub">Switch theme</div></div>
          <Toggle checked={light} onChange={setLight} label="Light mode" />
        </div>
        <div className="set-row">
          <div><div className="set-label">Push notifications</div><div className="set-sub">Signals & fills</div></div>
          <Toggle checked={notif} onChange={setNotif} label="Push notifications" />
        </div>
        <div className="set-row">
          <div><div className="set-label">Real-time alerts</div><div className="set-sub">Price & signal triggers</div></div>
          <Toggle checked={rtAlerts} onChange={setRtAlerts} label="Real-time alerts" />
        </div>
        <div className="set-row">
          <div><div className="set-label">Biometric login</div><div className="set-sub">Face ID / fingerprint</div></div>
          <Toggle checked={bio} onChange={setBio} label="Biometric login" />
        </div>
      </div>

      <div className="section-label">Account</div>
      <div className="glass-card set-card">
        {accountRows.map(({ icon: Icon, label }) => (
          <button className="nav-row" key={label}>
            <span className="nav-row-l"><Icon size={18} aria-hidden="true" /><span className="set-label">{label}</span></span>
            <ChevronRight size={18} className="chev" aria-hidden="true" />
          </button>
        ))}
      </div>

      <button className="btn-tertiary" onClick={onSignOut}>Sign out</button>
    </div>
  );
}

