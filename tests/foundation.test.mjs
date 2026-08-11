import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

test('M0 package identifies unified prototype version',()=>{
  const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  assert.equal(pkg.version,'0.0.3-m0-unified');
});

test('no committed root or web .env secret file exists',()=>{
  assert.equal(existsSync(new URL('../.env',import.meta.url)),false);
  assert.equal(existsSync(new URL('../apps/web/.env',import.meta.url)),false);
});

test('legacy React app is integrated into monorepo web workspace',()=>{
  assert.equal(existsSync(new URL('../apps/web/src/App.jsx',import.meta.url)),true);
  assert.equal(existsSync(new URL('../apps/web/src/styles/tokens.css',import.meta.url)),true);
});

test('browser no longer contains Finnhub credential input or VITE_FINNHUB_KEY',()=>{
  const live=readFileSync(new URL('../apps/web/src/live.jsx',import.meta.url),'utf8');
  assert.doesNotMatch(live,/VITE_FINNHUB_KEY/);
  assert.doesNotMatch(live,/Finnhub API key \(optional\)/);
  assert.match(live,/\/api\/market\/quotes/);
});

test('foundation SQL exists',()=>{
  const sql=readFileSync(new URL('../infra/sql/001_m0_foundation.sql',import.meta.url),'utf8');
  assert.match(sql,/tapp_build_audit/);
  assert.match(sql,/tapp_founder_test_users/);
});
