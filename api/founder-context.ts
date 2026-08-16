declare const process: { env: Record<string, string | undefined> };

export default function handler(_req: any, res: any) {
  res.status(200).json({
    founderTesting: process.env.FOUNDER_TESTING === 'true',
    environment: process.env.TAPP_ENV ?? process.env.VERCEL_ENV ?? 'unknown',
    buildVersion: process.env.TAPP_BUILD_VERSION ?? '0.0.2-m0-provider-ready',
    platform: 'vercel',
    databaseProvider: 'neon',
    identityProvider: 'clerk',
    observabilityProvider: process.env.OBSERVABILITY_PROVIDER ?? 'vercel',
    credentialsConfigured: {
      database: Boolean(process.env.DATABASE_URL),
      clerk: Boolean(process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
    }
  });
}
