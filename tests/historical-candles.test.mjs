import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const api = readFileSync(new URL('../api/market-candles.ts', import.meta.url), 'utf8');
const panels = readFileSync(new URL('../apps/web/src/components/panels.jsx', import.meta.url), 'utf8');
const ticker = readFileSync(new URL('../apps/web/src/components/ticker.jsx', import.meta.url), 'utf8');
const live = readFileSync(new URL('../apps/web/src/live.jsx', import.meta.url), 'utf8');

test('Massive historical candle gateway exists and keeps its key server-side', () => {
  assert.equal(existsSync(new URL('../api/market-candles.ts', import.meta.url)), true);
  assert.match(api, /MASSIVE_API_KEY/);
  assert.match(api, /api\.massive\.com\/v2\/aggs\/ticker/);
  assert.doesNotMatch(panels, /MASSIVE_API_KEY/);
});

test('chart timeframe buttons drive real state and historical requests', () => {
  assert.match(panels, /useState\("1D"\)/);
  assert.match(panels, /onClick=\{\(\) => setTimeframe\(t\)\}/);
  assert.match(panels, /\{ticker\} · \{timeframe\}/);
  assert.match(ticker, /useMarketHistory\(ticker, tf\)/);
});

test('authoritative quote timestamps drive local forming candles', () => {
  assert.match(live, /Date\.parse\(extra\.providerTimestamp\)/);
  assert.match(live, /candleTime/);
});

test('temporary degraded/error states do not clear provider protection', () => {
  const degradedBlock = live.match(/else if \(quotes\.length === 0\)[\s\S]*?setStatus\("degraded"\);/)?.[0] || '';
  const catchBlock = live.match(/catch \{[\s\S]*?setStatus\("error"\);/)?.[0] || '';
  assert.doesNotMatch(degradedBlock, /providerSet\.current\.clear/);
  assert.doesNotMatch(catchBlock, /providerSet\.current\.clear/);
});
