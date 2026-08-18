declare const process: { env: Record<string, string | undefined> };

const ALLOWED: Record<string, string> = {
  NVDA: 'NVDA',
  TSLA: 'TSLA',
  AAPL: 'AAPL',
  AMD: 'AMD',
  MSFT: 'MSFT',
  META: 'META',
  SPY: 'SPY',
  QQQ: 'QQQ',
  GOOGL: 'GOOGL',
  AMZN: 'AMZN',
  COIN: 'COIN',
  PLTR: 'PLTR',
  GLD: 'GLD',
};

type Timeframe = '1H' | '1D' | '1W' | '1M' | '1Y';
type TimeframeSpec = {
  multiplier: number;
  timespan: 'minute' | 'hour' | 'day' | 'week';
  lookbackMs: number;
  maxBars: number;
  cacheSeconds: number;
};

const DAY = 86_400_000;

// Fetch enough calendar time to survive weekends/holidays, then return only the
// most recent bars needed for the requested view. Massive aggregate timestamps
// are provider timestamps; the browser never invents historical timestamps.
const TIMEFRAMES: Record<Timeframe, TimeframeSpec> = {
  '1H': { multiplier: 5, timespan: 'minute', lookbackMs: 3 * DAY, maxBars: 12, cacheSeconds: 30 },
  '1D': { multiplier: 15, timespan: 'minute', lookbackMs: 7 * DAY, maxBars: 64, cacheSeconds: 60 },
  '1W': { multiplier: 1, timespan: 'hour', lookbackMs: 14 * DAY, maxBars: 80, cacheSeconds: 120 },
  '1M': { multiplier: 1, timespan: 'day', lookbackMs: 45 * DAY, maxBars: 31, cacheSeconds: 300 },
  '1Y': { multiplier: 1, timespan: 'week', lookbackMs: 400 * DAY, maxBars: 60, cacheSeconds: 900 },
};

const asDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export default async function handler(req: any, res: any) {
  const traceId = crypto.randomUUID();
  res.setHeader('x-tapp-trace-id', traceId);

  const symbol = String(req.query?.symbol ?? '').trim().toUpperCase();
  const timeframe = String(req.query?.timeframe ?? '1D').trim().toUpperCase() as Timeframe;
  const providerSymbol = ALLOWED[symbol];
  const spec = TIMEFRAMES[timeframe];

  if (!providerSymbol || !spec) {
    return res.status(400).json({
      provider: 'massive',
      configured: Boolean(process.env.MASSIVE_API_KEY?.trim()),
      state: 'invalid-request',
      candles: [],
      traceId,
    });
  }

  const key = process.env.MASSIVE_API_KEY?.trim();
  if (!key) {
    return res.status(200).json({
      provider: 'massive',
      configured: false,
      state: 'unconfigured',
      symbol,
      timeframe,
      candles: [],
      timestamp: new Date().toISOString(),
      traceId,
    });
  }

  const now = Date.now();
  const from = asDate(now - spec.lookbackMs);
  const to = asDate(now);
  const url = new URL(
    `https://api.massive.com/v2/aggs/ticker/${encodeURIComponent(providerSymbol)}` +
    `/range/${spec.multiplier}/${spec.timespan}/${from}/${to}`
  );
  url.searchParams.set('adjusted', 'true');
  url.searchParams.set('sort', 'asc');
  url.searchParams.set('limit', '5000');
  url.searchParams.set('apiKey', key);

  try {
    const r = await fetch(url.toString(), { headers: { accept: 'application/json' } });
    const body: any = await r.json().catch(() => ({}));

    if (!r.ok) {
      const state = r.status === 429 ? 'rate-limited' : 'provider-error';
      return res.status(r.status === 429 ? 429 : 502).json({
        provider: 'massive',
        configured: true,
        state,
        symbol,
        timeframe,
        candles: [],
        providerStatus: body?.status,
        providerMessage: body?.error || body?.message,
        timestamp: new Date().toISOString(),
        traceId,
      });
    }

    const results = Array.isArray(body?.results) ? body.results : [];
    const candles = results
      .filter((bar: any) =>
        typeof bar?.o === 'number' && typeof bar?.h === 'number' &&
        typeof bar?.l === 'number' && typeof bar?.c === 'number' &&
        typeof bar?.t === 'number'
      )
      .map((bar: any) => ({
        o: bar.o,
        h: bar.h,
        l: bar.l,
        c: bar.c,
        v: typeof bar.v === 'number' ? bar.v : undefined,
        t: bar.t,
      }))
      .slice(-spec.maxBars);

    res.setHeader('Cache-Control', `public, s-maxage=${spec.cacheSeconds}, stale-while-revalidate=${spec.cacheSeconds * 4}`);
    return res.status(200).json({
      provider: 'massive',
      configured: true,
      state: candles.length ? 'ready' : 'empty',
      symbol,
      timeframe,
      candles,
      timestamp: new Date().toISOString(),
      traceId,
    });
  } catch {
    return res.status(502).json({
      provider: 'massive',
      configured: true,
      state: 'gateway-error',
      symbol,
      timeframe,
      candles: [],
      timestamp: new Date().toISOString(),
      traceId,
    });
  }
}
