export type TappEnvironment = 'development' | 'founder-testing' | 'production';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: 'tapp-api';
  environment: TappEnvironment;
  buildVersion: string;
  timestamp: string;
  checks: {
    api: 'ok';
    database: 'unconfigured' | 'ok' | 'error';
    identity: 'unconfigured' | 'ok' | 'error';
  };
}

export interface FounderSession {
  userId: string;
  role: 'founder' | 'test-user';
  entitlementTier: 'free' | 'level-1' | 'level-2' | 'level-3';
}
