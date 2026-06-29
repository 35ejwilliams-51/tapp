import React, { useState } from "react";

/*
  AuthScreen — login / signup UI (Phase 1).
  This is the presentation layer only. `onAuth({ name, email })` is the seam
  where real authentication plugs in; right now it just enters the app.
*/
export function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const ready = emailOk && pw.length >= 6 && (mode === "signin" || name.trim().length > 1);
  const submit = () => { if (ready) onAuth({ name: name.trim() || "Alex Morgan", email }); };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-logo">TAPP</div>
        <div className="auth-tag">Institutional-grade signals, beautifully simple.</div>

        <div className="seg" role="tablist" aria-label="Authentication mode">
          <button role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button>
          <button role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <div className="field">
              <label htmlFor="auth-name">Full name</label>
              <input id="auth-name" className="input-text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" className="input-text" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="auth-pw">Password</label>
            <input id="auth-pw" className="input-text" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <button className="btn btn-primary" disabled={!ready} onClick={submit}
                  style={!ready ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
          {mode === "signin" && (
            <button className="link-inline" style={{ alignSelf: "center" }}>Forgot password?</button>
          )}
        </div>

        <div className="auth-foot">
          <button className="link-inline" onClick={() => onAuth({ name: "Alex Morgan", email: "alex.morgan@example.com" })}>
            Skip for demo →
          </button>
        </div>
      </div>
    </div>
  );
}
