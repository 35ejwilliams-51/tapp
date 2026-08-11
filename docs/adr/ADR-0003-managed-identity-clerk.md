# ADR-0003 — Managed Identity: Clerk

Status: **Selected for M0 Founder Testing**

Decision: Use Clerk for Founder/test-user identity and authentication.

Why: mature JavaScript/Node SDKs, customizable sign-in, backend request authentication, MFA support for public launch, and low implementation burden.

Boundary: TAPP stores its own user/profile/entitlement records keyed to an external identity subject. Business entitlements remain server-side TAPP policy, not UI-only Clerk flags.
