import React, { useState } from "react";
import { Bell, User, Sun, Moon } from "lucide-react";
import { useMediaQuery } from "./hooks.js";
import { Toggle } from "./components/primitives.jsx";
import { SideRail, BottomNav, cap } from "./components/nav.jsx";
import {
  PortfolioPanel, ScannerPanel, WatchlistPanel, ChartPanel, AlertsPanel,
  ScannerScreen, Placeholder,
} from "./components/panels.jsx";
import { LiveProvider, LiveBar } from "./live.jsx";
import { HomeScreen, ProfileScreen } from "./components/screens.jsx";
import { AnalyzeLayout, AnalyzeScreen, TradeScreen } from "./components/copilot.jsx";
import { AuthScreen } from "./components/auth.jsx";
import { UIProvider } from "./components/ticker.jsx";
import { ClerkProvider, SignIn, useUser, useClerk } from "@clerk/react";

// Clerk publishable key from env. When absent, the app falls back to the
// built-in mock login so the project still runs (and the preview still works).
const CLERK_KEY = (() => {
  try { return import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY || ""; } catch { return ""; }
})();

const clerkAppearance = {
  variables: {
    colorPrimary: "#00E5FF",
    colorBackground: "#0E0E10",
    colorText: "#F5F5F7",
    colorTextSecondary: "#A1A1AA",
    colorInputBackground: "#19191C",
    colorInputText: "#F5F5F7",
    borderRadius: "12px",
  },
};

function CenterScreen({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--color-bg-primary)", padding: 20 }}>
      {children}
    </div>
  );
}

/*
  Breakpoint ladder:
    < 1000px    mobile      single column + bottom tab bar
    1000–1279   tablet      3-panel (Scanner 40 / Chart 35 / Alerts 25)
    1280–2559   desktop     4-panel (Portfolio 20 / Scanner 25 / Chart 35 / Alerts 20)
    ≥ 2560      ultra-wide  5-panel (Portfolio 18 / Scanner 22 / Watchlist 15 / Chart 30 / Alerts 15)
*/
function AppInner({ user, onSignOut }) {
  const isTablet = useMediaQuery("(min-width: 1000px)");
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isUltra = useMediaQuery("(min-width: 2560px)");
  const [tab, setTab] = useState("scanner");
  const [light, setLight] = useState(false);

  const rootProps = light ? { "data-theme": "light" } : {};

  const headerActions = (
    <div className="header-actions">
      <div className="theme-switch">
        {light ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
        <Toggle checked={light} onChange={setLight} label="Light mode" />
      </div>
      <button className="header-icon-btn" aria-label="Notifications"><Bell size={20} /></button>
      <button className="header-icon-btn" aria-label="Account"><User size={20} /></button>
    </div>
  );

  /* ----- tablet / desktop / ultra-wide ----- */
  if (isTablet) {
    let grid;
    if (isUltra) {
      grid = <div className="dash-grid grid-5"><PortfolioPanel /><ScannerPanel /><WatchlistPanel /><ChartPanel /><AlertsPanel /></div>;
    } else if (isDesktop) {
      grid = <div className="dash-grid grid-4"><PortfolioPanel /><ScannerPanel full /><ChartPanel /><AlertsPanel /></div>;
    } else {
      grid = <div className="dash-grid grid-3"><ScannerPanel full /><ChartPanel /><AlertsPanel /></div>;
    }

    let content;
    if (tab === "scanner") {
      content = <main className={`main-content dashboard ${isDesktop ? "desk" : ""}`}>{grid}</main>;
    } else if (tab === "analyze") {
      content = <main className="main-content analyze-main"><AnalyzeLayout /></main>;
    } else if (tab === "trade") {
      content = <main className="main-content"><div className="screen"><TradeScreen /></div></main>;
    } else if (tab === "home") {
      content = <main className="main-content"><HomeScreen user={user} /></main>;
    } else {
      content = <main className="main-content"><ProfileScreen user={user} onSignOut={onSignOut} light={light} setLight={setLight} /></main>;
    }

    return (
      <div {...rootProps}>
        <UIProvider>
        <div className={`app-container has-rail ${isDesktop ? "is-desktop" : ""}`}>
          <SideRail active={tab} onChange={setTab} />
          <div className="app-body">
            <header className="header"><div className="header-logo">TAPP</div>{headerActions}</header>
            <LiveBar />
            {content}
          </div>
        </div>
        </UIProvider>
      </div>
    );
  }

  /* ----- mobile ----- */
  const mobileScreen = {
    scanner: <ScannerScreen />,
    home: <HomeScreen user={user} />,
    analyze: <AnalyzeScreen />,
    trade: <TradeScreen />,
    profile: <ProfileScreen user={user} onSignOut={onSignOut} light={light} setLight={setLight} />,
  }[tab] || <Placeholder label={cap(tab)} />;

  return (
    <div {...rootProps}>
      <UIProvider>
      <div className="app-container">
        <header className="header sticky"><div className="header-logo">TAPP</div>{headerActions}</header>
        <LiveBar />
        <main className="main-content">{mobileScreen}</main>
        <BottomNav active={tab} onChange={setTab} />
      </div>
      </UIProvider>
    </div>
  );
}

function MockGate() {
  const [user, setUser] = useState(null);
  if (!user) return <AuthScreen onAuth={setUser} />;
  return <AppInner user={user} onSignOut={() => setUser(null)} />;
}

function ClerkGate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  if (!isLoaded) return <CenterScreen><div className="placeholder">Loading…</div></CenterScreen>;
  if (!isSignedIn) return <CenterScreen><SignIn routing="hash" appearance={clerkAppearance} /></CenterScreen>;
  const u = {
    name: user.fullName || user.firstName || "Trader",
    email: user.primaryEmailAddress?.emailAddress || "",
  };
  return <AppInner user={u} onSignOut={() => signOut()} />;
}

export default function App() {
  const gate = CLERK_KEY
    ? (
      <ClerkProvider publishableKey={CLERK_KEY} appearance={clerkAppearance}>
        <ClerkGate />
      </ClerkProvider>
    )
    : <MockGate />;
  return <LiveProvider>{gate}</LiveProvider>;
}
