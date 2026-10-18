-- Plan date, a richer invite preview (so an invitee can see what they will vote on), and
-- comment threads with reactions on plans and on events (docs/DECISIONS.md D-012).
--
-- Comment rules:
--   * Plan threads: any plan member (guests included) may read and write.
--   * Event threads are public to every signed-in user, but only a real account (not an anonymous
--     guest) may write: they are public, so they need a lasting identity for moderation.
--   * Replies nest two levels below the root; a reply to a level-2 comment becomes its sibling.
--   * All writes go through RPCs; tables have no insert/update policies.

-- ---------------------------------------------------------------- plan date

alter table public.plans add column plan_date date;

create function public.update_plan(p_plan_id uuid, p_title text, p_plan_date date)
returns public.plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_plan public.plans;
begin
  update public.plans
    set title = btrim(p_title), plan_date = p_plan_date
    where id = p_plan_id and organizer_id = (select auth.uid()) and status = 'open'
    returning * into v_plan;
  if not found then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return v_plan;
end;
$$;

-- ---------------------------------------------------------------- invite preview

drop function public.get_plan_preview(text);
create function public.get_plan_preview(p_invite_code text)
returns table (
  plan_id uuid, title text, status text, organizer_name text, plan_date date,
  member_names text[], events jsonb
)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.title, p.status, o.display_name, p.plan_date,
         coalesce((
           select array_agg(pr.display_name order by m.joined_at)
           from public.plan_members m join public.profiles pr on pr.id = m.user_id
           where m.plan_id = p.id
         ), '{}'),
         coalesce((
           select jsonb_agg(pe.snapshot order by pe.created_at)
           from public.plan_events pe where pe.plan_id = p.id
         ), '[]'::jsonb)
  from public.plans p
  join public.profiles o on o.id = p.organizer_id
  where p.invite_code = p_invite_code;
$$;

-- ---------------------------------------------------------------- comments

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('plan', 'event')),
  target_id text not null check (char_length(target_id) between 1 and 200),
  plan_id uuid references public.plans (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  depth smallint not null default 0 check (depth between 0 and 2),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) <= 1000),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  check ((target_type = 'plan') = (plan_id is not null))
);
create index comments_target_idx on public.comments (target_type, target_id, created_at);
create index comments_parent_idx on public.comments (parent_id);
create index comments_author_idx on public.comments (author_id, created_at);
create index comments_plan_idx on public.comments (plan_id);

create table public.comment_reactions (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null check (emoji in ('like', 'love', 'laugh', 'fire', 'wow')),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id, emoji)
);
create index comment_reactions_user_idx on public.comment_reactions (user_id);

create table public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text check (char_length(reason) <= 300),
  created_at timestamptz not null default now(),
  unique (comment_id, reporter_id)
);
create index comment_reports_reporter_idx on public.comment_reports (reporter_id);

alter table public.comments enable row level security;
alter table public.comment_reactions enable row level security;
alter table public.comment_reports enable row level security;

-- Plan threads: members only. Event threads: any signed-in user.
create policy comments_select on public.comments for select to authenticated
  using (
    (target_type = 'plan' and private.is_plan_member(plan_id))
    or target_type = 'event'
  );

-- Reactions are visible wherever their comment is (the subquery runs under comments' RLS).
create policy reactions_select on public.comment_reactions for select to authenticated
  using (exists (select 1 from public.comments c where c.id = comment_id));
create policy reactions_insert on public.comment_reactions for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.comments c where c.id = comment_id and c.deleted_at is null));
create policy reactions_delete on public.comment_reactions for delete to authenticated
  using (user_id = (select auth.uid()));

-- Reports: you may file one; nobody reads them through the API (moderators use the dashboard).
create policy reports_insert on public.comment_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and exists (select 1 from public.comments c where c.id = comment_id));

-- ---------------------------------------------------------------- comment RPCs

create function public.add_comment(
  p_target_type text, p_target_id text, p_parent_id uuid, p_body text, p_display_name text default null
)
returns public.comments
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_plan_id uuid;
  v_parent public.comments;
  v_depth smallint := 0;
  v_parent_id uuid := p_parent_id;
  v_comment public.comments;
  v_body text := btrim(coalesce(p_body, ''));
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if char_length(v_body) = 0 or char_length(v_body) > 1000 then
    raise exception 'invalid_body' using errcode = '22023';
  end if;

  if p_target_type = 'event' then
    -- Public threads need a lasting identity.
    if coalesce((select auth.jwt()) ->> 'is_anonymous', 'false')::boolean then
      raise exception 'account_required' using errcode = '42501';
    end if;
  elsif p_target_type = 'plan' then
    begin
      v_plan_id := p_target_id::uuid;
    exception when invalid_text_representation then
      raise exception 'plan_not_found' using errcode = 'P0002';
    end;
    if not private.is_plan_member(v_plan_id) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  else
    raise exception 'invalid_target' using errcode = '22023';
  end if;

  -- An account without a profile yet (commenting before creating or joining a plan) names itself here.
  if not exists (select 1 from public.profiles where id = v_uid) then
    if p_display_name is null or char_length(btrim(p_display_name)) = 0 then
      raise exception 'display_name_required' using errcode = '22023';
    end if;
    insert into public.profiles (id, display_name) values (v_uid, btrim(p_display_name));
  end if;

  if (select count(*) from public.comments where author_id = v_uid and created_at > now() - interval '1 minute') >= 8 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if p_parent_id is not null then
    select * into v_parent from public.comments where id = p_parent_id;
    if not found or v_parent.target_type <> p_target_type or v_parent.target_id <> p_target_id then
      raise exception 'parent_not_found' using errcode = 'P0002';
    end if;
    if v_parent.depth >= 2 then
      -- Deeper than two levels: become the sibling of the level-2 comment.
      v_parent_id := v_parent.parent_id;
      v_depth := 2;
    else
      v_depth := v_parent.depth + 1;
    end if;
  end if;

  insert into public.comments (target_type, target_id, plan_id, parent_id, depth, author_id, body)
    values (p_target_type, p_target_id, v_plan_id, v_parent_id, v_depth, v_uid, v_body)
    returning * into v_comment;
  return v_comment;
end;
$$;

-- Author, or the organizer for plan threads. The row stays so replies keep their place.
create function public.delete_comment(p_comment_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_comment public.comments;
begin
  select * into v_comment from public.comments where id = p_comment_id;
  if not found then
    raise exception 'comment_not_found' using errcode = 'P0002';
  end if;
  if v_comment.author_id is distinct from v_uid
     and not (v_comment.plan_id is not null and private.is_plan_organizer(v_comment.plan_id)) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.comments set deleted_at = now(), body = '' where id = p_comment_id;
end;
$$;

-- ---------------------------------------------------------------- privileges and realtime

revoke all on all tables in schema public from anon;
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.update_plan(uuid, text, date),
  public.get_plan_preview(text),
  public.add_comment(text, text, uuid, text, text),
  public.delete_comment(uuid)
to authenticated;

alter table public.comment_reactions replica identity full;
alter table public.comments replica identity full;
alter publication supabase_realtime add table public.comments, public.comment_reactions;
