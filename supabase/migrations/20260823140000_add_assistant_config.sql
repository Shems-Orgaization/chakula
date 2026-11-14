create table if not exists public.assistant_config (
  id int primary key default 1 check (id = 1),
  user_daily int not null default 25,
  global_daily int not null default 200,
  cooldown_seconds int not null default 3
);
insert into public.assistant_config (id) values (1) on conflict do nothing;

create table if not exists public.assistant_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  count int not null default 0,
  last_call_at timestamptz not null default 'epoch',
  primary key (user_id, day)
);
create table if not exists public.assistant_usage_global (
  day date primary key,
  count int not null default 0
);
create table if not exists public.recipe_corrections (
  id uuid primary key default gen_random_uuid(),
  recipe_id text not null references public.recipes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  note text not null check (char_length(note) between 1 and 1000),
  status text not null default 'new' check (status in ('new','reviewed','applied','dismissed')),
  created_at timestamptz not null default now()
);

alter table public.assistant_config enable row level security;
alter table public.assistant_usage enable row level security;
alter table public.assistant_usage_global enable row level security;
alter table public.recipe_corrections enable row level security;

drop policy if exists corrections_insert_own on public.recipe_corrections;
create policy corrections_insert_own on public.recipe_corrections
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists corrections_select_own on public.recipe_corrections;
create policy corrections_select_own on public.recipe_corrections
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.take_assistant_slot()
returns table(allowed boolean, reason text, remaining int)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  d date := (now() at time zone 'Africa/Nairobi')::date;
  cfg public.assistant_config;
  u public.assistant_usage;
  g int;
begin
  if uid is null then
    return query select false, 'unauthorized', 0; return;
  end if;
  select * into cfg from public.assistant_config where id = 1;
  insert into public.assistant_usage_global (day, count) values (d, 0) on conflict do nothing;
  insert into public.assistant_usage (user_id, day) values (uid, d) on conflict do nothing;
  select count into g from public.assistant_usage_global where day = d for update;
  select * into u from public.assistant_usage where user_id = uid and day = d for update;
  if g >= cfg.global_daily then
    return query select false, 'global_cap', 0; return;
  end if;
  if u.count >= cfg.user_daily then
    return query select false, 'user_cap', 0; return;
  end if;
  if now() - u.last_call_at < make_interval(secs => cfg.cooldown_seconds) then
    return query select false, 'cooldown', cfg.user_daily - u.count; return;
  end if;
  update public.assistant_usage set count = count + 1, last_call_at = now()
    where user_id = uid and day = d;
  update public.assistant_usage_global set count = count + 1 where day = d;
  return query select true, 'ok', cfg.user_daily - u.count - 1;
end $$;

revoke all on function public.take_assistant_slot() from public, anon;
grant execute on function public.take_assistant_slot() to authenticated;