-- Plan date, invite preview and comment threads (migration *plan_date_preview_comments*).
-- Same convention as plans_rls.test.sql: throwaway users in one transaction, always finishes by
-- raising 'ALL_OK: ...' so everything rolls back. Any other message names the failed check.

do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid(); g uuid := gen_random_uuid();
  v_plan public.plans; v_p jsonb; n int; r text := '';
  root public.comments; l1 public.comments; l2 public.comments; l3 public.comments; ev public.comments;
begin
  insert into auth.users (id) values (a), (b), (c), (g);
  set local role authenticated;

  -- A creates a plan with a date and one event; B joins.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  select * into v_plan from public.create_plan('Fredag', 'Alice');
  insert into public.plan_events (plan_id, source, external_id, snapshot, added_by) values (v_plan.id, 'demo', 'x1', '{"id":"x1","title":"One"}', a);
  select * into v_plan from public.update_plan(v_plan.id, 'Fredag kväll', '2026-10-23');
  if v_plan.plan_date <> date '2026-10-23' or v_plan.title <> 'Fredag kväll' then raise exception 'FAIL update_plan'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'is_anonymous', true)::text, true);
  begin perform public.update_plan(v_plan.id, 'Hacked', null); raise exception 'FAIL non-member updated plan';
  exception when insufficient_privilege then null; end;
  select count(*) into n from public.get_plan_preview(v_plan.invite_code); if n <> 1 then raise exception 'FAIL preview'; end if;
  perform 1 from public.get_plan_preview(v_plan.invite_code) p where jsonb_array_length(p.events) = 1 and p.member_names = array['Alice'] and p.plan_date = date '2026-10-23';
  if not found then raise exception 'FAIL preview contents'; end if;
  perform public.join_plan(v_plan.invite_code, 'Bob');
  r := r || 'plan date + preview ok; ';

  -- Threads: root (A) -> level 1 (B) -> level 2 (A) -> deeper reply becomes a level-2 sibling.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  select * into root from public.add_comment('plan', v_plan.id::text, null, 'Vem är med på Amon Amarth?');
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'is_anonymous', true)::text, true);
  select * into l1 from public.add_comment('plan', v_plan.id::text, root.id, 'Jag!');
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  select * into l2 from public.add_comment('plan', v_plan.id::text, l1.id, 'Bra.');
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'is_anonymous', true)::text, true);
  select * into l3 from public.add_comment('plan', v_plan.id::text, l2.id, 'Biljetter?');
  if root.depth <> 0 or l1.depth <> 1 or l2.depth <> 2 or l3.depth <> 2 or l3.parent_id <> l1.id then
    raise exception 'FAIL depth/flatten % % % % %', root.depth, l1.depth, l2.depth, l3.depth, l3.parent_id = l1.id;
  end if;
  r := r || 'two-level threads ok; ';

  -- Outsider C cannot read or write plan threads; a guest cannot write on events; an account can.
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated', 'is_anonymous', true)::text, true);
  select count(*) into n from public.comments; if n <> 0 then raise exception 'FAIL outsider reads comments %', n; end if;
  begin perform public.add_comment('plan', v_plan.id::text, null, 'hej', 'Cem'); raise exception 'FAIL outsider commented';
  exception when insufficient_privilege then null; end;
  begin perform public.add_comment('event', 'tm-1', null, 'hej', 'Cem'); raise exception 'FAIL guest commented on event';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims', json_build_object('sub', g, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  begin perform public.add_comment('event', 'tm-1', null, 'hej'); raise exception 'FAIL missing display name accepted';
  exception when invalid_parameter_value then null; end;
  select * into ev from public.add_comment('event', 'tm-1', null, 'Sjukt bra konsert!', 'Gül');
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated', 'is_anonymous', true)::text, true);
  select count(*) into n from public.comments where target_type = 'event'; if n <> 1 then raise exception 'FAIL event comments not public'; end if;
  r := r || 'permissions ok; ';

  -- Reactions: member reacts once per emoji; outsider cannot react to a plan comment.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'is_anonymous', true)::text, true);
  insert into public.comment_reactions (comment_id, user_id, emoji) values (root.id, b, 'like');
  begin insert into public.comment_reactions (comment_id, user_id, emoji) values (root.id, b, 'like'); raise exception 'FAIL duplicate reaction';
  exception when unique_violation then null; end;
  insert into public.comment_reactions (comment_id, user_id, emoji) values (root.id, b, 'fire');
  begin insert into public.comment_reactions (comment_id, user_id, emoji) values (root.id, b, 'bogus'); raise exception 'FAIL bad emoji';
  exception when check_violation then null; end;
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated', 'is_anonymous', true)::text, true);
  begin insert into public.comment_reactions (comment_id, user_id, emoji) values (root.id, c, 'like'); raise exception 'FAIL outsider reacted';
  exception when insufficient_privilege then null; end;
  select count(*) into n from public.comment_reactions; if n <> 0 then raise exception 'FAIL outsider sees reactions'; end if;
  r := r || 'reactions ok; ';

  -- Delete: author or organizer only; the row stays, body is blanked.
  begin perform public.delete_comment(l1.id); raise exception 'FAIL outsider deleted';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  perform public.delete_comment(l1.id);  -- organizer removes B's comment
  select count(*) into n from public.comments where id = l1.id and deleted_at is not null and body = ''; if n <> 1 then raise exception 'FAIL soft delete'; end if;
  select count(*) into n from public.comments where parent_id = l1.id; if n <> 2 then raise exception 'FAIL replies lost %', n; end if;
  r := r || 'delete ok; ';

  -- Rate limit: at most 8 comments a minute.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  select count(*) into n from public.comments where author_id = a;
  for i in 1..(8 - n) loop perform public.add_comment('plan', v_plan.id::text, null, 'spam ' || i); end loop;
  begin perform public.add_comment('plan', v_plan.id::text, null, 'one too many'); raise exception 'FAIL rate limit';
  exception when raise_exception then if sqlerrm <> 'rate_limited' then raise; end if; end;
  r := r || 'rate limit ok; ';

  -- Report: you may file one, once; reading reports is not possible through the API.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated', 'is_anonymous', true)::text, true);
  insert into public.comment_reports (comment_id, reporter_id, reason) values (root.id, b, 'spam');
  begin insert into public.comment_reports (comment_id, reporter_id) values (root.id, b); raise exception 'FAIL duplicate report';
  exception when unique_violation then null; end;
  select count(*) into n from public.comment_reports; if n <> 0 then raise exception 'FAIL reports readable'; end if;
  r := r || 'report ok; ';

  raise exception 'ALL_OK: %', r;
end $$;
