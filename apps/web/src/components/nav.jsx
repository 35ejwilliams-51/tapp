import React from "react";
import { Home, Radar, CandlestickChart, Bell, User, Settings } from "lucide-react";

export const TAB_ICONS = { home: Home, scanner: Radar, chart: CandlestickChart, alerts: Bell, profile: User };
export const TABS = ["home", "scanner", "chart", "alerts", "profile"];
export const cap = (s) => s[0].toUpperCase() + s.slice(1);

export function TabItem({ id, active, onClick }) {
  const Icon = TAB_ICONS[id];
  return (
    <button className={`tab-item ${active ? "active" : ""}`} onClick={onClick}
            aria-current={active ? "page" : undefined} aria-label={cap(id)}>
      <Icon className="tab-icon" size={26} aria-hidden="true" />
      <span className="tab-label">{cap(id)}</span>
    </button>
  );
}

/* Mobile bottom tab bar. */
export function BottomNav({ active, onChange }) {
  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map((id) => <TabItem key={id} id={id} active={active === id} onClick={() => onChange(id)} />)}
    </nav>
  );
}

/* Tablet/desktop left side rail. */
export function SideRail({ active, onChange }) {
  return (
    <nav className="side-rail" aria-label="Primary">
      <div className="rail-logo">TAPP</div>
      {TABS.map((id) => {
        const Icon = TAB_ICONS[id];
        return (
          <button key={id} className={`rail-item ${active === id ? "active" : ""}`} onClick={() => onChange(id)}
                  aria-current={active === id ? "page" : undefined} aria-label={cap(id)}>
            <Icon className="tab-icon" size={24} aria-hidden="true" />
            <span className="rail-label">{cap(id)}</span>
          </button>
        );
      })}
      <div className="rail-spacer" />
      <button className="rail-item" aria-label="Settings"><Settings size={22} /></button>
    </nav>
  );
}
