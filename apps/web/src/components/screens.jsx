import React, { useState } from "react";
import { ChevronRight, CreditCard, Link2, Shield, LifeBuoy } from "lucide-react";
import { Toggle } from "./primitives.jsx";
import { ScannerHeroCard } from "./cards.jsx";
import { ChartPanel, AlertsPanel } from "./panels.jsx";
import { HERO, ALERTS, TONE } from "../data.js";
import { useLive } from "../live.jsx";
import { useUI } from "./ticker.jsx";

/* ---------------- Home ---------------- */
export function HomeScreen({ user }) {
  const live = useLive();
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const first = (user?.name || "there").split(" ")[0];
  const indices = [{ n: "S&P 500", s: "SPY" }, { n: "Nasdaq", s: "QQQ" }, { n: "Bitcoin", s: "BTC" }];
  return (
    <div className="screen">
      <div className="greeting">
        <h1>{greet}, {first}</h1>
        <p>Here's your market snapshot.</p>
      </div>

      <div className="glass-card home-summary">
        <span className="set-sub">Portfolio value</span>
        <span className="home-total">$62,167</span>
        <span className="pf-sub" style={{ color: "var(--color-cyan-ink)" }}>
          <span aria-hidden="true">▲</span> +$1,842 (3.05%) today
        </span>
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

/* ---------------- Mobile Chart / Alerts (reuse panels full-width) ---------------- */

export function ChartScreen() {
  const ui = useUI();
  const live = useLive();

  const symbols = [
    "NVDA",
    "TSLA",
    "AAPL",
    "AMD",
    "MSFT",
    "META",
    "SPY",
    "QQQ",
    "BTC",
  ];

  const activeTicker = ui?.activeTicker || "NVDA";
  const quote = live?.get(activeTicker);
  const price = quote?.price;
  const changePercent = quote?.changePercent ?? 0;
  const up = changePercent >= 0;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "calc(100vh - 220px)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginBottom: 4,
              }}
            >
              CHART WORKSPACE
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {activeTicker}
              </span>

              {price != null ? (
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {activeTicker === "BTC"
                    ? `$${Math.round(price).toLocaleString()}`
                    : activeTicker.includes("/")
                      ? price.toFixed(4)
                      : `$${price.toFixed(2)}`}
                </span>
              ) : null}

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: up
                    ? "var(--color-cyan-ink)"
                    : "var(--color-red-ink)",
                }}
              >
                {up ? "▲ +" : "▼ "}
                {changePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            Select market
          </div>
        </div>

        <div
          role="group"
          aria-label="Select chart symbol"
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {symbols.map((symbol) => {
            const selected = activeTicker === symbol;

            return (
              <button
                key={symbol}
                type="button"
                aria-pressed={selected}
                onClick={() => ui?.selectTicker(symbol)}
                style={{
                  minHeight: 34,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: selected
                    ? "1px solid var(--color-cyan)"
                    : "1px solid var(--color-border)",
                  background: selected
                    ? "rgba(0, 229, 255, 0.12)"
                    : "var(--color-bg-secondary)",
                  color: selected
                    ? "var(--color-cyan-ink)"
                    : "var(--color-text-primary)",
                  fontWeight: selected ? 700 : 600,
                  cursor: "pointer",
                }}
              >
                {symbol}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
        }}
      >
        <ChartPanel />
      </div>
    </div>
  );
}

export function AlertsScreen() {
  return <div className="screen"><AlertsPanel /></div>;
}