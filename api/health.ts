declare const process: { env: Record<string, string | undefined> };

export default function handler(_req: any, res: any) {
  const traceId = crypto.randomUUID();
  res.setHeader('x-tapp-trace-id', traceId);
  res.status(200).json({
    status: 'ok',
    service: 'tapp-founder-prototype',
    environment: process.env.TAPP_ENV ?? process.env.VERCEL_ENV ?? 'unknown',
    buildVersion: process.env.TAPP_BUILD_VERSION ?? '0.0.2-m0-provider-ready',
    timestamp: new Date().toISOString(),
    traceId,
    providers: {
      platform: 'vercel',
      database: process.env.DATABASE_URL ? 'configured' : 'unconfigured',
      identity: process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY ? 'configured' : 'unconfigured',
      observability: process.env.OBSERVABILITY_PROVIDER ?? 'vercel'
    }
  });
}
