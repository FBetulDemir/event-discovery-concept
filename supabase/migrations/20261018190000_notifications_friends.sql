-- Notifications (what is new in my plans since I last looked), friends, and inviting a friend into
-- a plan. Friends and invites need a real account (not an anonymous guest): a friend list needs a
-- lasting identity. All writes go through RPCs.

-- ---------------------------------------------------------------- unread activity

alter table public.plan_members add column last_seen_at timestamptz not null default now();

create function public.mark_plan_seen(p_plan_id uuid)
returns void
language sql security definer set search_path = ''
as $$
  update public.plan_members set last_seen_at = now()
  where plan_id = p_plan_id and user_id = (select auth.uid());
$$;

-- One row per plan I am in, counting other people's activity since I last opened it.
create function public.my_unread()
returns table (plan_id uuid, new_votes int, new_comments int, new_events int, new_members int, decided boolean)
language sql stable security definer set search_path = ''
as $$
  select m.plan_id,
    (select count(*)::int from public.votes v where v.plan_id = m.plan_id and v.user_id <> m.user_id and v.created_at > m.last_seen_at),
    (select count(*)::int from public.comments c where c.plan_id = m.plan_id and c.author_id <> m.user_id and c.deleted_at is null and c.created_at > m.last_seen_at),
    (select count(*)::int from public.plan_events e where e.plan_id = m.plan_id and e.added_by <> m.user_id and e.created_at > m.last_seen_at),
    (select count(*)::int from public.plan_members o where o.plan_id = m.plan_id and o.user_id <> m.user_id and o.joined_at > m.last_seen_at),
    exists (select 1 from public.plans p where p.id = m.plan_id and p.status = 'decided' and p.decided_at > m.last_seen_at)
  from public.plan_members m
  where m.user_id = (select auth.uid());
$$;

-- ---------------------------------------------------------------- friends

alter table public.profiles add column friend_code text not null unique
  default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

create table public.friendships (
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);
-- One row per pair, whichever direction asked first.
create unique index friendships_pair_idx on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index friendships_addressee_idx on public.friendships (addressee_id);

create table public.plan_invites (
  plan_id uuid not null references public.plans (id) on delete cascade,
  to_user uuid not null references public.profiles (id) on delete cascade,
  from_user uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (plan_id, to_user)
);
create index plan_invites_from_idx on public.plan_invites (from_user);
create index plan_invites_to_idx on public.plan_invites (to_user);

alter table public.friendships enable row level security;
alter table public.plan_invites enable row level security;
create policy friendships_select on public.friendships for select to authenticated
  using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));
create policy plan_invites_select on public.plan_invites for select to authenticated
  using (to_user = (select auth.uid()) or from_user = (select auth.uid()));

create function private.require_account()
returns uuid
language plpgsql stable security definer set search_path = ''
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if coalesce((select auth.jwt()) ->> 'is_anonymous', 'false')::boolean then
    raise exception 'account_required' using errcode = '42501';
  end if;
  return v_uid;
end;
$$;

-- An account names itself once; everything else (plans, comments, friends) reuses the profile.
create function public.set_display_name(p_name text)
returns public.profiles
language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := (select auth.uid()); v_profile public.profiles;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  insert into public.profiles (id, display_name) values (v_uid, btrim(p_name))
    on conflict (id) do update set display_name = excluded.display_name
    returning * into v_profile;
  return v_profile;
end;
$$;

create function public.my_friend_code()
returns text
language plpgsql stable security definer set search_path = ''
as $$
declare v_uid uuid := private.require_account(); v_code text;
begin
  select friend_code into v_code from public.profiles where id = v_uid;
  if v_code is null then raise exception 'display_name_required' using errcode = '22023'; end if;
  return v_code;
end;
$$;

-- Who a friend link belongs to, before you accept it.
create function public.friend_preview(p_code text)
returns table (user_id uuid, display_name text)
language sql stable security definer set search_path = ''
as $$
  select id, display_name from public.profiles where friend_code = p_code;
$$;

create function public.add_friend(p_code text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := private.require_account();
  v_friend uuid;
  v_existing public.friendships;
begin
  if not exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'display_name_required' using errcode = '22023';
  end if;
  select id into v_friend from public.profiles where friend_code = p_code;
  if v_friend is null then raise exception 'friend_not_found' using errcode = 'P0002'; end if;
  if v_friend = v_uid then raise exception 'cannot_add_self' using errcode = '22023'; end if;

  select * into v_existing from public.friendships
    where (requester_id = v_uid and addressee_id = v_friend) or (requester_id = v_friend and addressee_id = v_uid);
  if found then
    if v_existing.status = 'accepted' then return 'already_friends'; end if;
    if v_existing.requester_id = v_friend then
      update public.friendships set status = 'accepted' where requester_id = v_friend and addressee_id = v_uid;
      return 'accepted';
    end if;
    return 'already_requested';
  end if;
  insert into public.friendships (requester_id, addressee_id) values (v_uid, v_friend);
  return 'requested';
end;
$$;

create function public.respond_friend(p_requester uuid, p_accept boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := private.require_account();
begin
  if p_accept then
    update public.friendships set status = 'accepted'
      where requester_id = p_requester and addressee_id = v_uid and status = 'pending';
  else
    delete from public.friendships where requester_id = p_requester and addressee_id = v_uid and status = 'pending';
  end if;
end;
$$;

create function public.remove_friend(p_other uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := private.require_account();
begin
  delete from public.friendships
    where (requester_id = v_uid and addressee_id = p_other) or (requester_id = p_other and addressee_id = v_uid);
end;
$$;

-- Friends and requests with names (names of non-co-members are not readable through profiles).
create function public.my_friends()
returns table (user_id uuid, display_name text, relation text)
language sql stable security definer set search_path = ''
as $$
  select case when f.requester_id = (select auth.uid()) then f.addressee_id else f.requester_id end,
         p.display_name,
         case when f.status = 'accepted' then 'friend'
              when f.requester_id = (select auth.uid()) then 'outgoing' else 'incoming' end
  from public.friendships f
  join public.profiles p on p.id = case when f.requester_id = (select auth.uid()) then f.addressee_id else f.requester_id end
  where f.requester_id = (select auth.uid()) or f.addressee_id = (select auth.uid())
  order by p.display_name;
$$;

-- ---------------------------------------------------------------- inviting a friend into a plan

create function public.invite_friend(p_plan_id uuid, p_friend uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := private.require_account();
begin
  if not private.is_plan_member(p_plan_id) then raise exception 'forbidden' using errcode = '42501'; end if;
  if not exists (select 1 from public.friendships f where f.status = 'accepted'
      and ((f.requester_id = v_uid and f.addressee_id = p_friend) or (f.requester_id = p_friend and f.addressee_id = v_uid))) then
    raise exception 'not_friends' using errcode = '42501';
  end if;
  if exists (select 1 from public.plan_members where plan_id = p_plan_id and user_id = p_friend) then return; end if;
  insert into public.plan_invites (plan_id, to_user, from_user) values (p_plan_id, p_friend, v_uid) on conflict do nothing;
end;
$$;

create function public.my_invites()
returns table (plan_id uuid, plan_title text, plan_date date, from_name text, status text, event_count int, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select i.plan_id, p.title, p.plan_date, f.display_name, p.status,
         (select count(*)::int from public.plan_events e where e.plan_id = p.id), i.created_at
  from public.plan_invites i
  join public.plans p on p.id = i.plan_id
  join public.profiles f on f.id = i.from_user
  where i.to_user = (select auth.uid())
  order by i.created_at desc;
$$;

-- Accepting joins you to the plan and returns its invite code for navigation.
create function public.accept_invite(p_plan_id uuid)
returns text
language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := private.require_account(); v_code text;
begin
  if not exists (select 1 from public.plan_invites where plan_id = p_plan_id and to_user = v_uid) then
    raise exception 'invite_not_found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'display_name_required' using errcode = '22023';
  end if;
  insert into public.plan_members (plan_id, user_id) values (p_plan_id, v_uid) on conflict do nothing;
  delete from public.plan_invites where plan_id = p_plan_id and to_user = v_uid;
  select invite_code into v_code from public.plans where id = p_plan_id;
  return v_code;
end;
$$;

create function public.decline_invite(p_plan_id uuid)
returns void
language sql security definer set search_path = ''
as $$
  delete from public.plan_invites where plan_id = p_plan_id and to_user = (select auth.uid());
$$;

-- ---------------------------------------------------------------- privileges

revoke all on all tables in schema public from anon;
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.mark_plan_seen(uuid), public.my_unread(), public.set_display_name(text), public.my_friend_code(),
  public.friend_preview(text), public.add_friend(text), public.respond_friend(uuid, boolean),
  public.remove_friend(uuid), public.my_friends(), public.invite_friend(uuid, uuid), public.my_invites(),
  public.accept_invite(uuid), public.decline_invite(uuid)
to authenticated;
revoke execute on function private.require_account() from public, anon;
grant execute on function private.require_account() to authenticated;
