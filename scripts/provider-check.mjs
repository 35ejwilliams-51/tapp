const checks = [];
const add = (name, ok, detail) => checks.push({name, ok, detail});

const db = process.env.DATABASE_URL || '';
add('Neon DATABASE_URL', /^postgres(ql)?:\/\//.test(db), db ? 'PostgreSQL URL present' : 'missing');
const pk = process.env.CLERK_PUBLISHABLE_KEY || '';
const sk = process.env.CLERK_SECRET_KEY || '';
add('Clerk publishable key', pk.startsWith('pk_'), pk ? 'present' : 'missing');
add('Clerk secret key', sk.startsWith('sk_'), sk ? 'present' : 'missing');
add('Vercel environment', Boolean(process.env.VERCEL_ENV || process.env.VERCEL_URL), process.env.VERCEL_ENV || 'local/not deployed');
add('Observability provider', (process.env.OBSERVABILITY_PROVIDER || '') === 'vercel', process.env.OBSERVABILITY_PROVIDER || 'missing');

console.log(JSON.stringify({ready: checks.every(c=>c.ok), checks}, null, 2));
process.exitCode = checks.every(c=>c.ok) ? 0 : 2;
