import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../apps/web/src/App.jsx', import.meta.url), 'utf8');

test('tablet and desktop navigation renders distinct scanner, chart, and alerts screens', () => {
  assert.match(app, /scanner:\s*<main[^>]*>[\s\S]*scannerGrid/);
  assert.match(app, /chart:\s*<main[^>]*><ChartScreen\s*\/>/);
  assert.match(app, /alerts:\s*<main[^>]*><AlertsScreen\s*\/>/);
  assert.doesNotMatch(app, /const isPanelView = tab !== "home" && tab !== "profile"/);
});
