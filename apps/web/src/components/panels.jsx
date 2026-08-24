export function ChartPanel() {
  const live = useLive();
  const ui = useUI();
  const ticker = ui?.activeTicker || "NVDA";

  const [timeframe, setTimeframe] = React.useState("1D");
  const history = useMarketHistory(ticker, timeframe);

  const L = live?.get(ticker);
  const livePrice = L ? L.price : 172.40;

  const liveCandles = live?.getCandles(ticker) || [];

  const candles = history.supported
    ? history.candles
    : liveCandles;

  const chartReady = candles.length >= 2;

  const firstCandle = chartReady ? candles[0] : null;
  const lastCandle = chartReady ? candles[candles.length - 1] : null;

  const firstPrice = firstCandle
    ? Number(firstCandle.o ?? firstCandle.c)
    : null;

  const lastPrice = lastCandle
    ? Number(lastCandle.c)
    : livePrice;

  const timeframeChange =
    firstPrice && firstPrice > 0
      ? lastPrice - firstPrice
      : 0;

  const timeframePct =
    firstPrice && firstPrice > 0
      ? (timeframeChange / firstPrice) * 100
      : (L ? L.changePercent : 0);

  const up = timeframePct >= 0;

  const highs = candles
    .map((c) => Number(c.h))
    .filter((v) => Number.isFinite(v));

  const lows = candles
    .map((c) => Number(c.l))
    .filter((v) => Number.isFinite(v));

  const periodHigh = highs.length
    ? Math.max(...highs)
    : livePrice;

  const periodLow = lows.length
    ? Math.min(...lows)
    : livePrice;

  const periodVolume = candles.reduce(
    (sum, c) => sum + (Number(c.v) || 0),
    0
  );

  const historyMessage =
    history.status === "loading"
      ? `Loading ${timeframe} history…`
      : history.status === "unconfigured"
        ? "Historical feed unconfigured"
        : history.status === "error"
          ? "Historical data temporarily unavailable"
          : history.status === "empty"
            ? "No historical bars for this period"
            : "Building chart…";

  return (
    <section className="panel" aria-label="Chart">
      <div className="panel-head">
        <span className="panel-title">
          {ticker} · {timeframe}
        </span>

        <span
          className="panel-sub"
          style={{
            color: up
              ? "var(--color-cyan-ink)"
              : "var(--color-red-ink)",
          }}
        >
          {up ? "▲ +" : "▼ "}
          {timeframePct.toFixed(2)}%
        </span>
      </div>

      <div className="panel-body">
        <div className="chart-stat-row">
          <div className="chart-stat">
            <span className="k">PRICE</span>
            <span className="v">
              ${livePrice.toFixed(2)}
            </span>
          </div>

          <div className="chart-stat">
            <span className="k">HIGH</span>
            <span className="v">
              {periodHigh.toFixed(
                ticker.includes("/") ? 4 : 2
              )}
            </span>
          </div>

          <div className="chart-stat">
            <span className="k">LOW</span>
            <span className="v">
              {periodLow.toFixed(
                ticker.includes("/") ? 4 : 2
              )}
            </span>
          </div>

          <div className="chart-stat">
            <span className="k">VOL</span>
            <span className="v">
              {periodVolume > 0
                ? periodVolume.toLocaleString(undefined, {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  })
                : "—"}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 180 }}>
          {chartReady ? (
            <CandleChart candles={candles} />
          ) : (
            <div
              className="placeholder"
              style={{ minHeight: 180 }}
            >
              {history.supported
                ? historyMessage
                : "Building live chart…"}
            </div>
          )}
        </div>

        <div
          className="tf-row"
          role="group"
          aria-label="Chart timeframe"
        >
          {["1H", "1D", "1W", "1M", "1Y"].map((t) => (
            <button
              key={t}
              className={`tf-btn ${
                timeframe === t ? "active" : ""
              }`}
              aria-pressed={timeframe === t}
              onClick={() => setTimeframe(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {history.supported && history.provider ? (
          <div
            className="panel-sub"
            style={{ textAlign: "right" }}
          >
            Historical: {history.provider}
          </div>
        ) : null}
      </div>
    </section>
  );
}