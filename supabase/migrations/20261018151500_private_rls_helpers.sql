-- RLS helper functions are implementation details: keep them out of the exposed `public` schema
-- so they are not callable as /rest/v1/rpc/*. Policies reference functions by OID, so they keep
-- working after the move. The invoking role still needs USAGE on the schema to evaluate them.

create schema if not exists private;
grant usage on schema private to authenticated;

alter function public.is_plan_member(uuid) set schema private;
alter function public.is_plan_organizer(uuid) set schema private;
alter function public.is_plan_open(uuid) set schema private;
alter function public.shares_plan_with(uuid) set schema private;

create index plans_decided_plan_event_id_idx on public.plans (decided_plan_event_id);
