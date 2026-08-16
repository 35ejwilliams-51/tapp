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
  BTC: 'BINANCE:BTCUSDT',
  GLD: 'GLD',
};

type MarketProfile =
  | { kind: 'continuous' }
  | {
      kind: 'sessioned';
      timeZone: string;
      openHour: number;
      openMinute: number;
      closeHour: number;
      closeMinute: number;
    };

const MARKET_PROFILE: Record<string, MarketProfile> = {
  BTC: { kind: 'continuous' },

  NVDA: { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  TSLA: { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  AAPL: { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  AMD:  { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  MSFT: { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  META: { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  SPY:  { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  QQQ:  { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  GOOGL:{ kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  AMZN: { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  COIN: { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  PLTR: { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  GLD:  { kind: 'sessioned', timeZone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
};

function sessionState(symbol: string, nowMs: number): 'active' | 'inactive' {
  const profile = MARKET_PROFILE[symbol];

  if (!profile || profile.kind === 'continuous') {
    return 'active';
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: profile.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(nowMs));

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const weekday = get('weekday');

  if (weekday === 'Sat' || weekday === 'Sun') {
    return 'inactive';
  }

  const minutes =
    Number(get('hour')) * 60 +
    Number(get('minute'));

  const open =
    profile.openHour * 60 +
    profile.openMinute;

  const close =
    profile.closeHour * 60 +
    profile.closeMinute;

  return minutes >= open && minutes < close
    ? 'active'
    : 'inactive';
}

function classifyFreshness(
  symbol: string,
  providerMs: number | undefined,
  nowMs: number
): 'fresh' | 'stale' | 'session-inactive' | 'unknown' {
  if (!providerMs) {
    return 'unknown';
  }

  const ageMs = nowMs - providerMs;
  const profile = MARKET_PROFILE[symbol];

  if (profile?.kind === 'continuous') {
    return ageMs <= 300000
      ? 'fresh'
      : 'stale';
  }

  if (sessionState(symbol, nowMs) === 'inactive') {
    return 'session-inactive';
  }

  return ageMs <= 300000
    ? 'fresh'
    : 'stale';
}

export default async function handler(req: any, res: any) {
  const traceId = crypto.randomUUID();

  res.setHeader('x-tapp-trace-id', traceId);

  const raw = Array.isArray(req.query?.symbols)
    ? req.query.symbols.join(',')
    : (req.query?.symbols ?? '');

  const symbols = String(raw)
    .split(',')
    .map((v) => v.trim())
    .filter((v: string) => ALLOWED[v])
    .slice(0, 25);

  const key = process.env.FINNHUB_API_KEY?.trim();

  if (!key) {
    return res.status(200).json({
      provider: 'finnhub',
      configured: false,
      state: 'unconfigured',
      quotes: [],
      timestamp: new Date().toISOString(),
      traceId,
    });
  }

  const now = Date.now();

  const rows = await Promise.all(
    symbols.map(async (symbol: string) => {
      try {
        const r = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
            ALLOWED[symbol]
          )}&token=${encodeURIComponent(key)}`
        );

        if (!r.ok) {
          return null;
        }

        const q: any = await r.json();

        if (!(typeof q?.c === 'number') || q.c <= 0) {
          return null;
        }

        const providerMs =
          typeof q.t === 'number' && q.t > 0
            ? q.t * 1000
            : undefined;

        return {
          symbol,
          price: q.c,
          previousClose:
            q.pc > 0 ? q.pc : undefined,
          bid:
            q.b > 0 ? q.b : undefined,
          ask:
            q.a > 0 ? q.a : undefined,

          providerTimestamp: providerMs
            ? new Date(providerMs).toISOString()
            : undefined,

          receivedTimestamp:
            new Date(now).toISOString(),

          state: 'live',
          provider: 'finnhub',

          sessionState:
            sessionState(symbol, now),

          freshness:
            classifyFreshness(
              symbol,
              providerMs,
              now
            ),
        };
      } catch {
        return null;
      }
    })
  );

  const quotes = rows.filter(Boolean);

  return res.status(200).json({
    provider: 'finnhub',
    configured: true,
    state: quotes.length
      ? 'live'
      : 'error',
    quotes,
    timestamp:
      new Date().toISOString(),
    traceId,
  });
}

