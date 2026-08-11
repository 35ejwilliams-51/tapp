# ADR-0004 — M0 Observability: Vercel Built-In + TAPP Structured Logs

Status: **Selected for M0; re-evaluate before M7**

Decision: Start with Vercel runtime logs/observability plus TAPP trace IDs and structured events.

Reason: avoid adding an unnecessary fourth operational vendor at M0. M7 may add a dedicated observability/security platform if evidence shows the built-in stack is insufficient.
