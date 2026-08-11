import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('provider ADRs exist', () => {
  for (const name of [
    'ADR-0001-primary-platform-vercel.md',
    'ADR-0002-managed-postgres-neon.md',
    'ADR-0003-managed-identity-clerk.md',
    'ADR-0004-m0-observability-vercel.md'
  ]) assert.equal(existsSync(new URL(`../docs/adr/${name}`, import.meta.url)), true);
});

test('env template keeps market and identity secrets server-side', () => {
  const env=readFileSync(new URL('../.env.example',import.meta.url),'utf8');
  assert.match(env,/DATABASE_PROVIDER=neon/);
  assert.match(env,/IDENTITY_PROVIDER=clerk/);
  assert.match(env,/FINNHUB_API_KEY=\n/);
  assert.doesNotMatch(env,/VITE_FINNHUB_KEY/);
  assert.match(env,/CLERK_SECRET_KEY=\n/);
  assert.match(env,/DATABASE_URL=\n/);
});

test('Vercel deployment configuration exposes TAPP market gateway route', () => {
  const cfg=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
  assert.ok(cfg.rewrites.some(r=>r.source==='/api/market/quotes'));
});
