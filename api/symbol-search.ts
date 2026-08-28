declare const process: { env: Record<string, string | undefined> };

const SAFE_QUERY = /^[A-Za-z0-9 .&/-]{1,64}$/;
const SAFE_SYMBOL = /^[A-Z][A-Z0-9.-]{0,9}$/;

export default async function handler(req: any, res: any) {
  const traceId = crypto.randomUUID();
  res.setHeader('x-tapp-trace-id', traceId);
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1200');

  const query = String(req.query?.q ?? '').trim();
  if (query.length < 1 || !SAFE_QUERY.test(query)) {
    return res.status(200).json({ provider: 'finnhub', configured: true, state: 'ready', results: [], traceId });
  }

  const key = process.env.FINNHUB_API_KEY?.trim();
  if (!key) {
    return res.status(200).json({ provider: 'finnhub', configured: false, state: 'unconfigured', results: [], traceId });
  }

  try {
    const r = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${encodeURIComponent(key)}`);
    if (!r.ok) throw new Error(`provider ${r.status}`);
    const body: any = await r.json();
    const rows = Array.isArray(body?.result) ? body.result : [];

    const results = rows
      .map((row: any) => ({
        symbol: String(row?.displaySymbol || row?.symbol || '').trim().toUpperCase(),
        description: String(row?.description || '').trim(),
        type: String(row?.type || '').trim(),
      }))
      // Founder Prototype v0.1: universal U.S.-style equity/ETF symbol search.
      // Complex provider symbols are intentionally excluded until the canonical
      // multi-asset instrument layer is introduced.
      .filter((row: any) => SAFE_SYMBOL.test(row.symbol))
      .filter((row: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.symbol === row.symbol) === i)
      .slice(0, 8);

    return res.status(200).json({ provider: 'finnhub', configured: true, state: 'ready', results, traceId });
  } catch {
    return res.status(502).json({ provider: 'finnhub', configured: true, state: 'gateway-error', results: [], traceId });
  }
}
