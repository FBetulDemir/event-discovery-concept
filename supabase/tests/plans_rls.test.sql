-- RLS and RPC behaviour of plans/members/events/votes (supabase/migrations/*plans_votes_invites*).
--
-- Run in the Supabase SQL editor (or `supabase db query`) against a project with the migrations
-- applied. It creates throwaway users inside one transaction and ALWAYS finishes by raising
-- 'ALL_OK: ...' so everything rolls back. Success looks like an error whose message starts with
-- ALL_OK; any other message names the check that failed.

do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid();
  v_plan public.plans; v_code text; n int; e1 uuid; e2 uuid; r text := '';
begin
  insert into auth.users (id) values (a), (b), (c);
  set local role authenticated;

  -- A creates a plan and becomes its organizer
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select * into v_plan from public.create_plan('Fredag kväll', 'Alice');
  v_code := v_plan.invite_code;
  select count(*) into n from public.plan_members where plan_id = v_plan.id and role = 'organizer';
  if n <> 1 then raise exception 'FAIL organizer membership'; end if;
  r := r || 'create_plan ok; ';

  -- B (non-member) sees nothing, can preview by code, then joins (idempotently)
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  select count(*) into n from public.plans; if n <> 0 then raise exception 'FAIL B sees plans'; end if;
  select count(*) into n from public.get_plan_preview(v_code); if n <> 1 then raise exception 'FAIL preview'; end if;
  perform public.join_plan(v_code, 'Bob');
  select count(*) into n from public.plans; if n <> 1 then raise exception 'FAIL B cannot see after join'; end if;
  perform public.join_plan(v_code, 'Bob');
  r := r || 'preview/join ok; ';

  -- shortlist: members add, no duplicates, no spoofed added_by
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  insert into public.plan_events (plan_id, source, external_id, snapshot, added_by) values (v_plan.id, 'demo', 'x1', '{"title":"One"}', a) returning id into e1;
  insert into public.plan_events (plan_id, source, external_id, snapshot, added_by) values (v_plan.id, 'demo', 'x2', '{"title":"Two"}', a) returning id into e2;
  begin
    insert into public.plan_events (plan_id, source, external_id, snapshot, added_by) values (v_plan.id, 'demo', 'x1', '{}', a);
    raise exception 'FAIL duplicate event allowed';
  exception when unique_violation then null; end;
  begin
    insert into public.plan_events (plan_id, source, external_id, snapshot, added_by) values (v_plan.id, 'demo', 'x9', '{}', b);
    raise exception 'FAIL spoofed added_by allowed';
  exception when insufficient_privilege then null; end;
  r := r || 'shortlist ok; ';

  -- votes: one per member, movable, never someone else's
  insert into public.votes (plan_id, user_id, plan_event_id) values (v_plan.id, a, e1);
  begin
    insert into public.votes (plan_id, user_id, plan_event_id) values (v_plan.id, a, e2);
    raise exception 'FAIL second vote allowed';
  exception when unique_violation then null; end;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  insert into public.votes (plan_id, user_id, plan_event_id) values (v_plan.id, b, e1);
  update public.votes set plan_event_id = e2 where plan_id = v_plan.id and user_id = b;
  get diagnostics n = row_count; if n <> 1 then raise exception 'FAIL move vote'; end if;
  update public.votes set plan_event_id = e2 where plan_id = v_plan.id and user_id = a;
  get diagnostics n = row_count; if n <> 0 then raise exception 'FAIL B changed As vote'; end if;
  select count(*) into n from public.votes where plan_id = v_plan.id; if n <> 2 then raise exception 'FAIL B sees votes %', n; end if;
  r := r || 'votes ok; ';

  -- C (outsider) cannot read or write anything in the plan
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  select count(*) into n from public.votes; if n <> 0 then raise exception 'FAIL outsider reads votes'; end if;
  begin
    insert into public.votes (plan_id, user_id, plan_event_id) values (v_plan.id, c, e1);
    raise exception 'FAIL outsider voted';
  exception when insufficient_privilege or foreign_key_violation then null; end;
  begin
    insert into public.plan_events (plan_id, source, external_id, snapshot, added_by) values (v_plan.id, 'demo', 'x7', '{}', c);
    raise exception 'FAIL outsider added event';
  exception when insufficient_privilege or foreign_key_violation then null; end;
  r := r || 'outsider blocked; ';

  -- closing: members cannot; a tie must be broken by the organizer; then voting is locked
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  begin perform public.close_plan(v_plan.id); raise exception 'FAIL member closed plan';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  begin perform public.close_plan(v_plan.id); raise exception 'FAIL tie not detected';
  exception when raise_exception then if sqlerrm <> 'tie' then raise; end if; end;
  select * into v_plan from public.close_plan(v_plan.id, e2);
  if v_plan.status <> 'decided' or v_plan.decided_plan_event_id <> e2 then raise exception 'FAIL decide'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  update public.votes set plan_event_id = e1 where plan_id = v_plan.id and user_id = b;
  get diagnostics n = row_count; if n <> 0 then raise exception 'FAIL vote after close'; end if;
  r := r || 'close/tie/lock ok; ';

  -- the anon role (no session at all) gets nothing
  reset role; set local role anon;
  begin perform 1 from public.plans limit 1; raise exception 'FAIL anon read plans';
  exception when insufficient_privilege then null; end;
  begin perform public.get_plan_preview(v_code); raise exception 'FAIL anon rpc';
  exception when insufficient_privilege then null; end;
  r := r || 'anon blocked; ';

  raise exception 'ALL_OK: %', r;
end $$;
