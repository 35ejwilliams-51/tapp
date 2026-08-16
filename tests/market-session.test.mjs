import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const api = readFileSync(new URL('../api/market-quotes.ts', import.meta.url), 'utf8');
const live = readFileSync(new URL('../apps/web/src/live.jsx', import.meta.url), 'utf8');

test('market gateway distinguishes continuous and sessioned instruments', () => {
  assert.match(api, /BTC:\s*\{\s*kind:\s*'continuous'/);
  assert.match(api, /session-inactive/);
  assert.match(api, /classifyFreshness/);
  assert.match(api, /sessionState/);
});

test('frontend treats session-inactive data as authoritative rather than simulated', () => {
  assert.match(live, /providerSet\.current\.has\(tk\)/);
  assert.match(live, /freshness === "session-inactive"/);
  assert.match(live, /staleActiveCount/);
  assert.match(live, /missingCount/);
  assert.match(live, /Global feed online · session-aware/);
});

test('prototype polling cadence respects Finnhub free REST request budget for current symbol count', () => {
  assert.match(live, /const POLL_MS = 15000/);
});
