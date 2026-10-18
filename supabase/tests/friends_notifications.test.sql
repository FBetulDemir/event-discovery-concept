-- Unread activity, friends and plan invites (migration *notifications_friends*).
-- Same convention as the other tests: throwaway users in one transaction, always ends by raising
-- 'ALL_OK: ...' so everything rolls back; any other message names the failed check.
-- In one transaction now() never advances, so the test moves last_seen_at an hour back by hand.

do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid(); d uuid := gen_random_uuid(); g uuid := gen_random_uuid();
  v_plan public.plans; u record; n int; r text := ''; code_a text; code_c text; res text; ev uuid; inv_code text;
begin
  insert into auth.users (id) values (a), (b), (c), (d), (g);
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  select * into v_plan from public.create_plan('P', 'Alice');
  insert into public.plan_events (plan_id, source, external_id, snapshot, added_by) values (v_plan.id, 'demo', 'x1', '{"id":"x1"}', a) returning id into ev;

  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  perform public.join_plan(v_plan.invite_code, 'Bob');
  insert into public.votes (plan_id, user_id, plan_event_id) values (v_plan.id, b, ev);
  perform public.add_comment('plan', v_plan.id::text, null, 'hej');
  reset role; update public.plan_members set last_seen_at = now() - interval '1 hour' where plan_id = v_plan.id; set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  select * into u from public.my_unread() where plan_id = v_plan.id;
  if u.new_votes <> 0 or u.new_comments <> 0 or u.new_members <> 1 then raise exception 'FAIL own activity counted %', u; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  select * into u from public.my_unread() where plan_id = v_plan.id;
  if u.new_votes <> 1 or u.new_comments <> 1 or u.new_members <> 1 or u.decided then raise exception 'FAIL unread counts %', u; end if;
  perform public.mark_plan_seen(v_plan.id);
  select * into u from public.my_unread() where plan_id = v_plan.id;
  if u.new_votes + u.new_comments + u.new_members <> 0 then raise exception 'FAIL mark seen %', u; end if;
  perform public.close_plan(v_plan.id);
  reset role; update public.plan_members set last_seen_at = now() - interval '1 hour' where plan_id = v_plan.id; set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  select * into u from public.my_unread() where plan_id = v_plan.id;
  if not u.decided then raise exception 'FAIL decided flag'; end if;
  r := r || 'unread ok; ';

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  code_a := public.my_friend_code();
  perform set_config('request.jwt.claims', json_build_object('sub', g, 'role', 'authenticated', 'is_anonymous', true)::text, true);
  begin perform public.my_friend_code(); raise exception 'FAIL guest has friend code'; exception when insufficient_privilege then null; end;
  begin perform public.add_friend(code_a); raise exception 'FAIL guest added friend'; exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  begin perform public.add_friend('nope'); raise exception 'FAIL unknown code'; exception when no_data_found then null; end;
  res := public.add_friend(code_a); if res <> 'requested' then raise exception 'FAIL request %', res; end if;
  if public.add_friend(code_a) <> 'already_requested' then raise exception 'FAIL duplicate request'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  begin perform public.add_friend(code_a); raise exception 'FAIL added self'; exception when invalid_parameter_value then null; end;
  select * into u from public.my_friends(); if u.relation <> 'incoming' or u.display_name <> 'Bob' then raise exception 'FAIL incoming %', u; end if;
  perform public.respond_friend(b, true);
  select * into u from public.my_friends(); if u.relation <> 'friend' then raise exception 'FAIL accepted %', u; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  perform public.set_display_name('Cem'); code_c := public.my_friend_code();
  perform public.add_friend(code_a);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  if public.add_friend(code_c) <> 'accepted' then raise exception 'FAIL mutual add'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  select count(*) into n from public.friendships; if n <> 0 then raise exception 'FAIL friendships visible %', n; end if;
  r := r || 'friends ok; ';

  begin perform public.invite_friend(v_plan.id, a); raise exception 'FAIL non-member invited'; exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  begin perform public.invite_friend(v_plan.id, d); raise exception 'FAIL invited a non-friend'; exception when insufficient_privilege then null; end;
  perform public.invite_friend(v_plan.id, c);
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  select count(*) into n from public.my_invites(); if n <> 1 then raise exception 'FAIL invites %', n; end if;
  inv_code := public.accept_invite(v_plan.id);
  if inv_code <> v_plan.invite_code then raise exception 'FAIL invite code'; end if;
  select count(*) into n from public.plan_members where plan_id = v_plan.id and user_id = c; if n <> 1 then raise exception 'FAIL not joined'; end if;
  select count(*) into n from public.my_invites(); if n <> 0 then raise exception 'FAIL invite kept'; end if;
  r := r || 'invites ok; ';

  raise exception 'ALL_OK: %', r;
end $$;
