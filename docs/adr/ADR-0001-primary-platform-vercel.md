# ADR-0001 — Primary Founder Testing Platform: Vercel

Status: **Selected for M0 Founder Testing**

Decision: Use Vercel as the primary managed platform for the Founder Testing web/API deployment.

Why: strong TypeScript/JavaScript workflow, monorepo support, automatic CI/CD, environment variables, deployment previews, built-in runtime logs/observability, spend controls, and instant rollback. TAPP retains portability by keeping database, identity, contracts, and business rules outside Vercel-specific APIs where practical.

Exit trigger: unacceptable cost, missing control/security requirement, architecture constraint, or superior validated replacement.
