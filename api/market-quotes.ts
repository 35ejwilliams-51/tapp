const ALLOWED: Record<string,string> = {
  NVDA:'NVDA', TSLA:'TSLA', AAPL:'AAPL', AMD:'AMD', MSFT:'MSFT', META:'META',
  SPY:'SPY', QQQ:'QQQ', GOOGL:'GOOGL', AMZN:'AMZN', COIN:'COIN', PLTR:'PLTR',
  BTC:'BINANCE:BTCUSDT', GLD:'GLD'
};

export default async function handler(req:any, res:any) {
  const traceId = crypto.randomUUID();
  res.setHeader('x-tapp-trace-id', traceId);
  const raw = Array.isArray(req.query?.symbols) ? req.query.symbols.join(',') : (req.query?.symbols ?? '');
  const symbols = String(raw).split(',').map(v=>v.trim()).filter((v:string)=>ALLOWED[v]).slice(0,25);
  const key = process.env.FINNHUB_API_KEY?.trim();
  if (!key) return res.status(200).json({provider:'finnhub', configured:false, state:'unconfigured', quotes:[], timestamp:new Date().toISOString(), traceId});
  const now = Date.now();
  const rows = await Promise.all(symbols.map(async (symbol:string) => {
    try {
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ALLOWED[symbol])}&token=${encodeURIComponent(key)}`);
      if (!r.ok) return null;
      const q:any = await r.json();
      if (!(typeof q?.c === 'number') || q.c <= 0) return null;
      const providerMs = typeof q.t === 'number' && q.t > 0 ? q.t*1000 : undefined;
      return {
        symbol, price:q.c, previousClose: q.pc > 0 ? q.pc : undefined,
        bid:q.b > 0 ? q.b : undefined, ask:q.a > 0 ? q.a : undefined,
        providerTimestamp:providerMs ? new Date(providerMs).toISOString() : undefined,
        receivedTimestamp:new Date(now).toISOString(), state:'live', provider:'finnhub',
        freshness: providerMs ? (now-providerMs <= 300000 ? 'fresh' : 'stale') : 'unknown'
      };
    } catch { return null; }
  }));
  res.status(200).json({provider:'finnhub', configured:true, state:rows.some(Boolean)?'live':'error', quotes:rows.filter(Boolean), timestamp:new Date().toISOString(), traceId});
}
