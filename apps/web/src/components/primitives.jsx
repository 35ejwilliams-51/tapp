import React from "react";

/* Inline-SVG sparkline. direction: "up" | "down" | "gold". */
export function Sparkline({ data, direction = "up", height = 48 }) {
  const width = 320;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / span) * height).toFixed(1)}`);
  const color = direction === "down" ? "var(--color-red)" : direction === "gold" ? "var(--color-gold)" : "var(--color-cyan)";
  const gid = React.useId();
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height={height}
         role="img" aria-label={`Trend ${direction === "down" ? "down" : "up"}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${pts.join(" ")} ${width},${height}`} fill={`url(#${gid})`} stroke="none" />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Candlestick chart. candles: [{ o, h, l, c }] */
export function CandleChart({ candles }) {
  const W = 520, H = 240, pad = 8;
  const max = Math.max(...candles.map(c => c.h));
  const min = Math.min(...candles.map(c => c.l));
  const span = max - min || 1;
  const cw = (W - pad * 2) / candles.length;
  const y = (v) => pad + (H - pad * 2) * (1 - (v - min) / span);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height="100%" role="img" aria-label="Candlestick chart">
      {candles.map((c, i) => {
        const up = c.c >= c.o;
        const color = up ? "var(--color-cyan)" : "var(--color-red)";
        const cx = pad + i * cw + cw / 2;
        const bodyTop = y(Math.max(c.o, c.c));
        const bodyBot = y(Math.min(c.o, c.c));
        const bw = Math.max(2, cw * 0.6);
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth="1" opacity="0.8" />
            <rect x={cx - bw / 2} y={bodyTop} width={bw} height={Math.max(1, bodyBot - bodyTop)} fill={color} opacity={up ? 0.9 : 0.85} />
          </g>
        );
      })}
    </svg>
  );
}

/* Accessible switch (Part 4). */
export function Toggle({ checked, onChange, label }) {
  return (
    <button className={`toggle ${checked ? "active" : ""}`} role="switch" aria-checked={checked}
            aria-label={label} onClick={() => onChange(!checked)}>
      <span className="toggle-thumb" />
    </button>
  );
}
