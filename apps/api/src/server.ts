import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { loadConfig } from '../../../packages/config/src/index.ts';
import { databaseConfigurationHealth, identityConfigurationHealth, marketConfigurationHealth, fetchFinnhubQuotes } from '../../../packages/providers/src/index.ts';

const config = loadConfig();
const here = dirname(fileURLToPath(import.meta.url));
const webRoot = normalize(join(here, '../../web'));

const mime: Record<string,string> = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml'
};

function json(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
  res.end(JSON.stringify(body, null, 2));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const traceId = crypto.randomUUID();
  res.setHeader('x-tapp-trace-id', traceId);

  if (url.pathname === '/api/health') {
    return json(res, 200, {
      status: 'ok', service: 'tapp-api', environment: config.env,
      buildVersion: config.buildVersion, timestamp: new Date().toISOString(),
      traceId,
      checks: {
        api: 'ok',
        database: databaseConfigurationHealth(),
        identity: identityConfigurationHealth(),
        observability: process.env.OBSERVABILITY_PROVIDER ?? 'console',
        marketData: marketConfigurationHealth()
      }
    });
  }

  if (url.pathname === '/api/market/quotes') {
    const symbols = (url.searchParams.get('symbols') ?? '').split(',').map(v => v.trim()).filter(Boolean);
    const quotes = await fetchFinnhubQuotes(symbols);
    const health = marketConfigurationHealth();
    return json(res, 200, {
      provider: health.provider, configured: health.configured,
      state: quotes.length ? 'live' : 'unconfigured',
      quotes, timestamp: new Date().toISOString(), traceId
    });
  }

  if (url.pathname === '/api/founder/context') {
    return json(res, 200, {
      environment: config.env,
      buildVersion: config.buildVersion,
      founderTesting: config.founderTesting,
      identityProvider: process.env.IDENTITY_PROVIDER ?? 'clerk',
      database: databaseConfigurationHealth(),
      identity: identityConfigurationHealth(),
      observabilityProvider: process.env.OBSERVABILITY_PROVIDER ?? 'vercel',
      marketData: marketConfigurationHealth(),
      platform: process.env.VERCEL_ENV ? 'vercel' : 'local',
      message: 'M0 provider-ready scaffold active. External checks become live when Founder credentials are supplied.'
    });
  }

  let rel = url.pathname === '/' ? '/index.html' : url.pathname;
  if (rel.includes('..')) return json(res, 400, {error:'invalid_path'});
  const path = normalize(join(webRoot, rel));
  if (!path.startsWith(webRoot)) return json(res, 403, {error:'forbidden'});
  try {
    const body = await readFile(path);
    res.writeHead(200, {'content-type': mime[extname(path)] ?? 'application/octet-stream'});
    res.end(body);
  } catch {
    json(res, 404, {error:'not_found', traceId});
  }
});

server.listen(config.port, () => {
  console.log(JSON.stringify({event:'tapp.api.started', port:config.port, environment:config.env, buildVersion:config.buildVersion}));
});
