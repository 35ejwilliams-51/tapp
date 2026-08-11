export type RuntimeConfig = {
  env: 'development' | 'founder-testing' | 'production';
  port: number;
  buildVersion: string;
  databaseUrl?: string;
  identityProvider: string;
  founderTesting: boolean;
};

export function loadConfig(): RuntimeConfig {
  const rawEnv = process.env.TAPP_ENV ?? 'development';
  const env = ['development','founder-testing','production'].includes(rawEnv)
    ? rawEnv as RuntimeConfig['env']
    : 'development';
  return {
    env,
    port: Number(process.env.TAPP_PORT ?? 8787),
    buildVersion: process.env.TAPP_BUILD_VERSION ?? 'dev-local',
    databaseUrl: process.env.DATABASE_URL,
    identityProvider: process.env.IDENTITY_PROVIDER ?? 'unconfigured',
    founderTesting: (process.env.FOUNDER_TESTING ?? 'false').toLowerCase() === 'true'
  };
}
