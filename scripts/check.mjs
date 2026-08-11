import {existsSync, readFileSync} from 'node:fs';
const required=[
  'package.json','.env.example','apps/api/src/server.ts','apps/web/index.html','apps/web/src/App.jsx',
  'apps/web/src/live.jsx','packages/contracts/src/index.ts','packages/providers/src/market.ts','infra/sql/001_m0_foundation.sql'
];
for(const f of required){if(!existsSync(new URL('../'+f,import.meta.url))){throw new Error('Missing '+f)}}
const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
if(!pkg.scripts?.test || !pkg.scripts?.start || !pkg.scripts?.['dev:web']) throw new Error('Required scripts missing');
const live=readFileSync(new URL('../apps/web/src/live.jsx',import.meta.url),'utf8');
if(live.includes('VITE_FINNHUB_KEY')) throw new Error('Browser-side Finnhub secret seam still present');
console.log('Unified M0 static checks passed');
