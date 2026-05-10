-- Orchestration sessions storage, indexing, search, and access controls.

create extension if not exists pgcrypto;

create table if not exists public.orchestration_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  task text not null,
  agents jsonb not null default '[]'::jsonb,
  consensus jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists orchestration_sessions_session_id_idx
  on public.orchestration_sessions (session_id);

create index if not exists orchestration_sessions_task_idx
  on public.orchestration_sessions (task);

create index if not exists orchestration_sessions_agents_gin_idx
  on public.orchestration_sessions using gin (agents);

create index if not exists orchestration_sessions_consensus_gin_idx
  on public.orchestration_sessions using gin (consensus);

create index if not exists orchestration_sessions_metrics_gin_idx
  on public.orchestration_sessions using gin (metrics);

create index if not exists orchestration_sessions_created_at_idx
  on public.orchestration_sessions (created_at desc);

alter table public.orchestration_sessions enable row level security;

-- Constrained read policy:
-- - service_role can read everything
-- - authenticated users can only read rows where task does not begin with "internal:"
drop policy if exists orchestration_sessions_select on public.orchestration_sessions;
create policy orchestration_sessions_select
  on public.orchestration_sessions
  for select
  to authenticated, service_role
  using (
    auth.role() = 'service_role'
    or (auth.role() = 'authenticated' and task !~* '^internal:')
  );

-- No direct client writes. Inserts are handled by a SECURITY DEFINER function below.
drop policy if exists orchestration_sessions_insert on public.orchestration_sessions;
create policy orchestration_sessions_insert
  on public.orchestration_sessions
  for insert
  to service_role
  with check (auth.role() = 'service_role');

drop policy if exists orchestration_sessions_update on public.orchestration_sessions;
create policy orchestration_sessions_update
  on public.orchestration_sessions
  for update
  to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists orchestration_sessions_delete on public.orchestration_sessions;
create policy orchestration_sessions_delete
  on public.orchestration_sessions
  for delete
  to service_role
  using (auth.role() = 'service_role');

-- Server-side safe write API. Use from trusted backend only.
create or replace function public.insert_orchestration_session(
  p_session_id text,
  p_task text,
  p_agents jsonb default '[]'::jsonb,
  p_consensus jsonb default '{}'::jsonb,
  p_metrics jsonb default '{}'::jsonb,
  p_created_at timestamptz default null
)
returns public.orchestration_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.orchestration_sessions;
begin
  if auth.role() <> 'service_role' then
    raise exception 'insert_orchestration_session is restricted to service role';
  end if;

  if coalesce(length(trim(p_session_id)), 0) = 0 then
    raise exception 'session_id is required';
  end if;

  if coalesce(length(trim(p_task)), 0) = 0 then
    raise exception 'task is required';
  end if;

  insert into public.orchestration_sessions (
    session_id,
    task,
    agents,
    consensus,
    metrics,
    created_at
  )
  values (
    p_session_id,
    p_task,
    coalesce(p_agents, '[]'::jsonb),
    coalesce(p_consensus, '{}'::jsonb),
    coalesce(p_metrics, '{}'::jsonb),
    coalesce(p_created_at, timezone('utc', now()))
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.insert_orchestration_session(text, text, jsonb, jsonb, jsonb, timestamptz) from public;
grant execute on function public.insert_orchestration_session(text, text, jsonb, jsonb, jsonb, timestamptz) to service_role;

-- GET-friendly search function for RPC (supports filters, pagination, and sort).
create or replace function public.search_orchestration_sessions(
  p_task_keyword text default null,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null,
  p_page integer default 1,
  p_page_size integer default 25,
  p_sort_by text default 'created_at',
  p_sort_order text default 'desc'
)
returns setof public.orchestration_sessions
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 25), 1), 200);
  v_offset integer := (v_page - 1) * v_page_size;
  v_sort_by text := case when p_sort_by in ('created_at', 'task', 'session_id') then p_sort_by else 'created_at' end;
  v_sort_order text := case when lower(coalesce(p_sort_order, 'desc')) in ('asc', 'desc') then lower(p_sort_order) else 'desc' end;
begin
  return query execute format(
    'select *
       from public.orchestration_sessions
      where ($1 is null or task ilike ''%%'' || $1 || ''%%'')
        and ($2 is null or created_at >= $2)
        and ($3 is null or created_at <= $3)
      order by %I %s
      limit $4 offset $5',
    v_sort_by,
    v_sort_order
  )
  using p_task_keyword, p_start_date, p_end_date, v_page_size, v_offset;
end;
$$;

revoke all on function public.search_orchestration_sessions(text, timestamptz, timestamptz, integer, integer, text, text) from public;
grant execute on function public.search_orchestration_sessions(text, timestamptz, timestamptz, integer, integer, text, text)
  to authenticated, service_role;
