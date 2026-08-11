export type IdentityHealth = {
  configured: boolean;
  provider: 'clerk';
  status: 'unconfigured' | 'configured' | 'error';
  detail?: string;
};

export function identityConfigurationHealth(): IdentityHealth {
  const publishable = process.env.CLERK_PUBLISHABLE_KEY?.trim();
  const secret = process.env.CLERK_SECRET_KEY?.trim();
  if (!publishable && !secret) return { configured: false, provider: 'clerk', status: 'unconfigured' };
  if (!publishable || !secret) {
    return { configured: true, provider: 'clerk', status: 'error', detail: 'Both Clerk publishable and secret keys are required.' };
  }
  return { configured: true, provider: 'clerk', status: 'configured' };
}

export function clerkAuthorizedParties(): string[] {
  return (process.env.CLERK_AUTHORIZED_PARTIES ?? '')
    .split(',').map(v => v.trim()).filter(Boolean);
}
