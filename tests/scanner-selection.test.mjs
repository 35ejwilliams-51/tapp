import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ticker = readFileSync(new URL('../apps/web/src/components/ticker.jsx', import.meta.url), 'utf8');
const cards = readFileSync(new URL('../apps/web/src/components/cards.jsx', import.meta.url), 'utf8');
const panels = readFileSync(new URL('../apps/web/src/components/panels.jsx', import.meta.url), 'utf8');

test('scanner selection drives the shared chart ticker', () => {
  assert.match(ticker, /activeTicker, setActiveTicker/);
  assert.match(ticker, /selectTicker: \(t\) => setActiveTicker\(t\)/);
  assert.match(cards, /ui\?\.selectTicker\(ticker\)/);
  assert.match(panels, /const ticker = ui\?\.activeTicker \|\| "NVDA"/);
  assert.match(panels, /live\?\.get\(ticker\)/);
  assert.match(panels, /getCandles\(ticker\)/);
  assert.match(panels, /\{ticker\} · \{timeframe\}/);
});

test('review trade still opens ticker detail without changing scanner click semantics', () => {
  assert.match(cards, /e\.stopPropagation\(\); open\(\);/);
  assert.match(ticker, /openTicker: \(t\)/);
});
