export type DatabaseHealth = {
  configured: boolean;
  provider: 'neon';
  status: 'unconfigured' | 'configured' | 'ok' | 'error';
  detail?: string;
};

export function databaseConfigurationHealth(): DatabaseHealth {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return { configured: false, provider: 'neon', status: 'unconfigured' };
  try {
    const parsed = new URL(url);
    const isPostgres = parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
    if (!isPostgres) return { configured: true, provider: 'neon', status: 'error', detail: 'DATABASE_URL must be PostgreSQL' };
    return { configured: true, provider: 'neon', status: 'configured' };
  } catch {
    return { configured: true, provider: 'neon', status: 'error', detail: 'DATABASE_URL is not a valid URL' };
  }
}

export async function pingDatabase(): Promise<DatabaseHealth> {
  const base = databaseConfigurationHealth();
  if (!base.configured || base.status === 'error') return base;
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`select 1 as ok`;
    return rows?.[0]?.ok === 1
      ? { configured: true, provider: 'neon', status: 'ok' }
      : { configured: true, provider: 'neon', status: 'error', detail: 'Unexpected database health response' };
  } catch (error) {
    return { configured: true, provider: 'neon', status: 'error', detail: error instanceof Error ? error.message : 'Database health check failed' };
  }
}
