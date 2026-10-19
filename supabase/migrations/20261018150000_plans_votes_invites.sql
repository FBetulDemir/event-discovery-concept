-- Monkey Match: profiles, plans, members, shortlisted events, votes.
--
-- Access model (see docs/CONTRACTS.md §6):
--   * Everyone is an authenticated user. Guests use Supabase anonymous sign-in, so `auth.uid()` is
--     always set; the `anon` role (no session at all) gets nothing.
--   * A plan is private to its members. The invite code is a capability: knowing it lets you
--     preview the plan (get_plan_preview) and join it (join_plan).
--   * Writes that must be atomic or privileged go through SECURITY DEFINER functions
--     (create_plan, join_plan, close_plan). Everything else is plain RLS.
--   * Events are NOT stored here. A plan references an event by (source, external_id) and keeps a
--     small snapshot so the shortlist survives the source dropping the event.

-- ---------------------------------------------------------------- tables

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  title text not null check (char_length(title) between 1 and 80),
  organizer_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'decided')),
  decided_plan_event_id uuid,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table public.plan_members (
  plan_id uuid not null references public.plans (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('organizer', 'member')),
  joined_at timestamptz not null default now(),
  primary key (plan_id, user_id)
);

create table public.plan_events (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  source text not null check (source in ('demo', 'ticketmaster', 'goteborgco')),
  external_id text not null check (char_length(external_id) between 1 and 200),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object' and octet_length(snapshot::text) < 4000),
  added_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (plan_id, source, external_id),
  unique (id, plan_id)
);

alter table public.plans
  add constraint plans_decided_plan_event_fk
  foreign key (decided_plan_event_id) references public.plan_events (id) on delete set null;

-- One vote per member per plan; the composite FKs make a vote impossible for a non-member or for
-- an event that is not on that plan's shortlist.
create table public.votes (
  plan_id uuid not null,
  user_id uuid not null,
  plan_event_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (plan_id, user_id),
  foreign key (plan_id, user_id) references public.plan_members (plan_id, user_id) on delete cascade,
  foreign key (plan_event_id, plan_id) references public.plan_events (id, plan_id) on delete cascade
);

create index plans_organizer_id_idx on public.plans (organizer_id);
create index plan_members_user_id_idx on public.plan_members (user_id);
create index plan_events_added_by_idx on public.plan_events (added_by);
create index votes_plan_event_id_idx on public.votes (plan_event_id, plan_id);

-- ---------------------------------------------------------------- helpers (RLS building blocks)

create function public.is_plan_member(p_plan_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.plan_members m
    where m.plan_id = p_plan_id and m.user_id = (select auth.uid())
  );
$$;

create function public.is_plan_organizer(p_plan_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.plans p
    where p.id = p_plan_id and p.organizer_id = (select auth.uid())
  );
$$;

create function public.is_plan_open(p_plan_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.plans p where p.id = p_plan_id and p.status = 'open');
$$;

create function public.shares_plan_with(p_user_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.plan_members a
    join public.plan_members b on b.plan_id = a.plan_id
    where a.user_id = (select auth.uid()) and b.user_id = p_user_id
  );
$$;

-- ---------------------------------------------------------------- RLS

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.plan_members enable row level security;
alter table public.plan_events enable row level security;
alter table public.votes enable row level security;

-- profiles: you, and people you share a plan with. Created/updated through create_plan/join_plan.
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.shares_plan_with(id));

-- plans: members read. Creation/closing go through functions; organizer may delete.
create policy plans_select on public.plans for select to authenticated
  using (public.is_plan_member(id));
create policy plans_delete on public.plans for delete to authenticated
  using (organizer_id = (select auth.uid()));

-- plan_members: members see each other; a member may leave (the organizer may not, delete the plan instead).
create policy plan_members_select on public.plan_members for select to authenticated
  using (public.is_plan_member(plan_id));
create policy plan_members_leave on public.plan_members for delete to authenticated
  using (user_id = (select auth.uid()) and role <> 'organizer');

-- plan_events: members add while open; the adder or the organizer removes while open.
create policy plan_events_select on public.plan_events for select to authenticated
  using (public.is_plan_member(plan_id));
create policy plan_events_insert on public.plan_events for insert to authenticated
  with check (
    added_by = (select auth.uid())
    and public.is_plan_member(plan_id)
    and public.is_plan_open(plan_id)
  );
create policy plan_events_delete on public.plan_events for delete to authenticated
  using (
    public.is_plan_open(plan_id)
    and (added_by = (select auth.uid()) or public.is_plan_organizer(plan_id))
  );

-- votes: everyone in the plan sees all votes; you manage only your own, only while the plan is open.
create policy votes_select on public.votes for select to authenticated
  using (public.is_plan_member(plan_id));
create policy votes_insert on public.votes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.is_plan_member(plan_id)
    and public.is_plan_open(plan_id)
  );
create policy votes_update on public.votes for update to authenticated
  using (user_id = (select auth.uid()) and public.is_plan_open(plan_id))
  with check (user_id = (select auth.uid()) and public.is_plan_open(plan_id));
create policy votes_delete on public.votes for delete to authenticated
  using (user_id = (select auth.uid()) and public.is_plan_open(plan_id));

-- ---------------------------------------------------------------- RPCs

create function public.create_plan(p_title text, p_display_name text)
returns public.plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_plan public.plans;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  insert into public.profiles (id, display_name)
    values (v_uid, btrim(p_display_name))
    on conflict (id) do update set display_name = excluded.display_name;
  insert into public.plans (title, organizer_id)
    values (btrim(p_title), v_uid)
    returning * into v_plan;
  insert into public.plan_members (plan_id, user_id, role)
    values (v_plan.id, v_uid, 'organizer');
  return v_plan;
end;
$$;

-- What a person with an invite link may see before joining.
create function public.get_plan_preview(p_invite_code text)
returns table (plan_id uuid, title text, status text, organizer_name text, member_count bigint)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.title, p.status, o.display_name,
         (select count(*) from public.plan_members m where m.plan_id = p.id)
  from public.plans p
  join public.profiles o on o.id = p.organizer_id
  where p.invite_code = p_invite_code;
$$;

create function public.join_plan(p_invite_code text, p_display_name text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_plan_id uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  select id into v_plan_id from public.plans where invite_code = p_invite_code;
  if v_plan_id is null then
    raise exception 'plan_not_found' using errcode = 'P0002';
  end if;
  insert into public.profiles (id, display_name)
    values (v_uid, btrim(p_display_name))
    on conflict (id) do update set display_name = excluded.display_name;
  insert into public.plan_members (plan_id, user_id)
    values (v_plan_id, v_uid)
    on conflict do nothing;
  return v_plan_id;
end;
$$;

-- Organizer closes voting. Without an explicit choice the leader wins; a tie must be broken by
-- the organizer passing p_plan_event_id (raises 'tie' otherwise). Mirrors src/lib/voting.ts.
create function public.close_plan(p_plan_id uuid, p_plan_event_id uuid default null)
returns public.plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_plan public.plans;
  v_winner uuid;
  v_leaders integer;
begin
  select * into v_plan from public.plans where id = p_plan_id for update;
  if not found or v_plan.organizer_id is distinct from v_uid then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_plan.status = 'decided' then
    raise exception 'already_decided' using errcode = 'P0001';
  end if;

  if p_plan_event_id is not null then
    if not exists (select 1 from public.plan_events where id = p_plan_event_id and plan_id = p_plan_id) then
      raise exception 'event_not_in_plan' using errcode = 'P0002';
    end if;
    v_winner := p_plan_event_id;
  else
    select count(*), (array_agg(t.id))[1] into v_leaders, v_winner
    from (
      select pe.id,
             rank() over (order by count(v.user_id) desc) as rk
      from public.plan_events pe
      left join public.votes v on v.plan_event_id = pe.id and v.plan_id = pe.plan_id
      where pe.plan_id = p_plan_id
      group by pe.id
    ) t
    where t.rk = 1;
    if v_leaders = 0 then
      raise exception 'no_events' using errcode = 'P0001';
    elsif v_leaders > 1 then
      raise exception 'tie' using errcode = 'P0001';
    end if;
  end if;

  update public.plans
    set status = 'decided', decided_plan_event_id = v_winner, decided_at = now()
    where id = p_plan_id
    returning * into v_plan;
  return v_plan;
end;
$$;

-- ---------------------------------------------------------------- privileges

revoke all on all tables in schema public from anon;
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.create_plan(text, text),
  public.get_plan_preview(text),
  public.join_plan(text, text),
  public.close_plan(uuid, uuid)
to authenticated;
-- The RLS helpers are called from policies as the invoking user.
grant execute on function
  public.is_plan_member(uuid),
  public.is_plan_organizer(uuid),
  public.is_plan_open(uuid),
  public.shares_plan_with(uuid)
to authenticated;

-- ---------------------------------------------------------------- realtime

-- DELETE payloads need the full old row so clients can filter them by plan_id.
alter table public.votes replica identity full;
alter table public.plan_events replica identity full;
alter table public.plan_members replica identity full;

alter publication supabase_realtime add table
  public.plans, public.plan_members, public.plan_events, public.votes;
