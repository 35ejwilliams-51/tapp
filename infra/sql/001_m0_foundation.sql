-- TAPP M0 foundation schema (PostgreSQL-compatible)
create table if not exists tapp_build_audit (
  id bigserial primary key,
  build_version text not null,
  environment text not null,
  deployed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists tapp_founder_test_users (
  user_id uuid primary key,
  external_identity_id text unique,
  role text not null check (role in ('founder','test-user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
