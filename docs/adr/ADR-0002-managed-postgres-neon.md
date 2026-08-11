# ADR-0002 — Managed PostgreSQL: Neon

Status: **Selected for M0 Founder Testing**

Decision: Use Neon as the managed PostgreSQL provider.

Why: PostgreSQL compatibility, serverless JavaScript/TypeScript driver, connection pooling, standard connection strings, and low operational burden. TAPP schema and SQL remain PostgreSQL-oriented rather than Neon-specific.

Portability: migrations stay in `infra/sql`; application data contracts do not expose Neon-specific payloads.
