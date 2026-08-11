export type CanonicalQuote = {
  symbol: string;
  price: number;
  previousClose?: number;
  bid?: number;
  ask?: number;
  providerTimestamp?: string;
  receivedTimestamp: string;
  state: 'live' | 'delayed' | 'historical' | 'illustrative' | 'simulated';
  provider: 'finnhub' | 'unconfigured';
  freshness: 'fresh' | 'stale' | 'unknown';
};

const FINNHUB_SYMBOLS: Record<string,string> = {
  NVDA:'NVDA', TSLA:'TSLA', AAPL:'AAPL', AMD:'AMD', MSFT:'MSFT', META:'META',
  SPY:'SPY', QQQ:'QQQ', GOOGL:'GOOGL', AMZN:'AMZN', COIN:'COIN', PLTR:'PLTR',
  BTC:'BINANCE:BTCUSDT', GLD:'GLD'
};

export function marketConfigurationHealth() {
  return process.env.FINNHUB_API_KEY?.trim()
    ? { configured:true, provider:'finnhub', status:'configured' as const }
    : { configured:false, provider:'finnhub', status:'unconfigured' as const };
}

export async function fetchFinnhubQuotes(symbols: string[]): Promise<CanonicalQuote[]> {
  const key = process.env.FINNHUB_API_KEY?.trim();
  if (!key) return [];
  const unique = [...new Set(symbols)].filter(s => FINNHUB_SYMBOLS[s]).slice(0, 25);
  const now = new Date();
  const rows = await Promise.all(unique.map(async symbol => {
    const providerSymbol = FINNHUB_SYMBOLS[symbol];
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(providerSymbol)}&token=${encodeURIComponent(key)}`;
      const res = await fetch(url, { headers: { 'user-agent':'TAPP-Founder-Prototype/0.0.3' } });
      if (!res.ok) return null;
      const q:any = await res.json();
      if (!(typeof q?.c === 'number') || q.c <= 0) return null;
      const providerMs = typeof q.t === 'number' && q.t > 0 ? q.t * 1000 : undefined;
      const ageMs = providerMs ? now.getTime() - providerMs : undefined;
      return {
        symbol,
        price:q.c,
        previousClose: typeof q.pc === 'number' && q.pc > 0 ? q.pc : undefined,
        bid: typeof q.b === 'number' && q.b > 0 ? q.b : undefined,
        ask: typeof q.a === 'number' && q.a > 0 ? q.a : undefined,
        providerTimestamp: providerMs ? new Date(providerMs).toISOString() : undefined,
        receivedTimestamp: now.toISOString(),
        state:'live' as const,
        provider:'finnhub' as const,
        freshness: ageMs === undefined ? 'unknown' as const : ageMs <= 5*60_000 ? 'fresh' as const : 'stale' as const
      };
    } catch {
      return null;
    }
  }));
  return rows.filter(Boolean) as CanonicalQuote[];
}
