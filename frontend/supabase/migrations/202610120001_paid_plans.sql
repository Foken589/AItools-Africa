-- AItools Africa one-time credit packs. Additive and namespaced because this
-- repository contains no existing migrations; inspect the live schema first.

create table if not exists public.aitools_plans (
  plan_key text primary key check (plan_key in ('starter', 'pro', 'max')),
  name text not null,
  amount_kobo integer not null check (amount_kobo > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  credits integer not null check (credits > 0),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.aitools_plans (plan_key, name, amount_kobo, currency, credits)
values ('starter', 'Starter', 100000, 'NGN', 100), ('pro', 'Pro', 350000, 'NGN', 400), ('max', 'Max', 800000, 'NGN', 1000)
on conflict (plan_key) do update set name = excluded.name, amount_kobo = excluded.amount_kobo, currency = excluded.currency, credits = excluded.credits, enabled = true;

create table if not exists public.aitools_credit_accounts (
  user_id uuid primary key references auth.users(id) on delete restrict,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.aitools_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  payer_email text not null,
  plan_key text not null references public.aitools_plans(plan_key),
  reference text not null unique check (reference ~ '^[A-Za-z0-9.=\-]{8,100}$'),
  amount_kobo integer not null check (amount_kobo > 0),
  currency text not null check (currency = 'NGN'),
  credits integer not null check (credits > 0),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'reversed')),
  provider_transaction_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists aitools_payments_user_created_idx on public.aitools_payments(user_id, created_at desc);

create table if not exists public.aitools_credit_lots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  payment_id uuid not null unique references public.aitools_payments(id) on delete restrict,
  credits_remaining integer not null check (credits_remaining >= 0),
  created_at timestamptz not null default now()
);
create index if not exists aitools_credit_lots_user_created_idx on public.aitools_credit_lots(user_id, created_at, id);

create table if not exists public.aitools_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  payment_id uuid references public.aitools_payments(id) on delete restrict,
  credit_lot_id uuid references public.aitools_credit_lots(id) on delete restrict,
  usage_id uuid,
  entry_type text not null check (entry_type in ('purchase', 'usage', 'refund')),
  amount integer not null check (amount <> 0),
  balance_after integer not null check (balance_after >= 0),
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists aitools_credit_ledger_user_created_idx on public.aitools_credit_ledger(user_id, created_at desc);

create table if not exists public.aitools_tool_usage (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  tool_key text not null check (tool_key = 'writing'),
  task text not null check (task in ('improve', 'summarize', 'email', 'study')),
  input_characters integer not null check (input_characters between 3 and 8000),
  output_characters integer not null check (output_characters > 0),
  credit_source text not null check (credit_source in ('free_daily', 'paid_credit')),
  created_at timestamptz not null default now()
);
create index if not exists aitools_tool_usage_user_created_idx on public.aitools_tool_usage(user_id, created_at desc);

create table if not exists public.aitools_webhook_events (
  event_key text primary key,
  event_type text not null,
  payment_reference text not null,
  received_at timestamptz not null default now()
);

alter table public.aitools_plans enable row level security;
alter table public.aitools_credit_accounts enable row level security;
alter table public.aitools_payments enable row level security;
alter table public.aitools_credit_lots enable row level security;
alter table public.aitools_credit_ledger enable row level security;
alter table public.aitools_tool_usage enable row level security;
alter table public.aitools_webhook_events enable row level security;

revoke all on public.aitools_plans, public.aitools_credit_accounts, public.aitools_payments,
  public.aitools_credit_lots, public.aitools_credit_ledger, public.aitools_tool_usage, public.aitools_webhook_events
  from anon, authenticated;

drop policy if exists "Anyone can view enabled AItools plans" on public.aitools_plans;
create policy "Anyone can view enabled AItools plans" on public.aitools_plans for select using (enabled);
drop policy if exists "Users can view their AItools credit balance" on public.aitools_credit_accounts;
create policy "Users can view their AItools credit balance" on public.aitools_credit_accounts for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users can view their AItools payments" on public.aitools_payments;
create policy "Users can view their AItools payments" on public.aitools_payments for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users can view their AItools credit ledger" on public.aitools_credit_ledger;
create policy "Users can view their AItools credit ledger" on public.aitools_credit_ledger for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users can view their AItools usage" on public.aitools_tool_usage;
create policy "Users can view their AItools usage" on public.aitools_tool_usage for select to authenticated using (user_id = (select auth.uid()));
-- No client policies exist for writes, plan edits, or webhook records.

create or replace function public.aitools_prepare_payment(p_plan_key text, p_reference text)
returns table(reference text, amount_kobo integer, currency text, credits integer, plan_name text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_email text; v_plan public.aitools_plans%rowtype;
begin
  if v_user is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select email into v_email from auth.users where id = v_user;
  if v_email is null then raise exception 'Verified email required' using errcode = '28000'; end if;
  if p_reference !~ '^[A-Za-z0-9.=\-]{8,100}$' then raise exception 'Invalid reference' using errcode = '22023'; end if;
  select * into v_plan from public.aitools_plans where plan_key = p_plan_key and enabled;
  if not found then raise exception 'Plan unavailable' using errcode = '22023'; end if;
  if (select count(*) from public.aitools_payments where user_id = v_user and status = 'pending' and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'Too many pending checkouts' using errcode = '54000';
  end if;
  insert into public.aitools_payments(user_id, payer_email, plan_key, reference, amount_kobo, currency, credits)
  values (v_user, v_email, v_plan.plan_key, p_reference, v_plan.amount_kobo, v_plan.currency, v_plan.credits);
  return query select p_reference, v_plan.amount_kobo, v_plan.currency, v_plan.credits, v_plan.name;
end; $$;

create or replace function public.aitools_get_my_payment(p_reference text)
returns table(reference text, amount_kobo integer, currency text, credits integer, status text, plan_name text)
language sql stable security definer set search_path = public, pg_temp as $$
  select p.reference, p.amount_kobo, p.currency, p.credits, p.status, pl.name
  from public.aitools_payments p join public.aitools_plans pl using (plan_key)
  where p.reference = p_reference and p.user_id = (select auth.uid())
$$;

create or replace function public.aitools_spend_credit(p_usage_id uuid)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_balance integer; v_lot uuid;
begin
  if v_user is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  insert into public.aitools_credit_accounts(user_id) values (v_user) on conflict (user_id) do nothing;
  select id into v_lot from public.aitools_credit_lots where user_id = v_user and credits_remaining > 0 order by created_at, id for update skip locked limit 1;
  if not found then return false; end if;
  update public.aitools_credit_accounts set balance = balance - 1, updated_at = now()
    where user_id = v_user and balance > 0 returning balance into v_balance;
  if not found then return false; end if;
  update public.aitools_credit_lots set credits_remaining = credits_remaining - 1 where id = v_lot;
  insert into public.aitools_credit_ledger(user_id, credit_lot_id, usage_id, entry_type, amount, balance_after, idempotency_key)
    values (v_user, v_lot, p_usage_id, 'usage', -1, v_balance, 'usage:' || p_usage_id::text);
  return true;
end; $$;

create or replace function public.aitools_refund_credit(p_user_id uuid, p_usage_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := p_user_id; v_balance integer; v_lot uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  if exists (select 1 from public.aitools_credit_ledger where user_id = v_user and idempotency_key = 'refund:' || p_usage_id::text) then return; end if;
  select credit_lot_id into v_lot from public.aitools_credit_ledger where user_id = v_user and usage_id = p_usage_id and entry_type = 'usage' for update;
  if not found or v_lot is null then
    raise exception 'No matching credit use' using errcode = '22023';
  end if;
  if exists (select 1 from public.aitools_credit_lots l join public.aitools_payments p on p.id = l.payment_id where l.id = v_lot and p.status = 'reversed') then return; end if;
  update public.aitools_credit_lots set credits_remaining = credits_remaining + 1 where id = v_lot;
  update public.aitools_credit_accounts set balance = balance + 1, updated_at = now() where user_id = v_user returning balance into v_balance;
  insert into public.aitools_credit_ledger(user_id, credit_lot_id, usage_id, entry_type, amount, balance_after, idempotency_key)
    values (v_user, v_lot, p_usage_id, 'refund', 1, v_balance, 'refund:' || p_usage_id::text);
end; $$;

create or replace function public.aitools_record_usage(p_user_id uuid, p_usage_id uuid, p_task text, p_input_characters integer, p_output_characters integer, p_credit_source text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := p_user_id;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  insert into public.aitools_tool_usage(id, user_id, tool_key, task, input_characters, output_characters, credit_source)
    values (p_usage_id, v_user, 'writing', p_task, p_input_characters, p_output_characters, p_credit_source);
end; $$;

create or replace function public.aitools_complete_payment(
  p_reference text, p_provider_transaction_id text, p_amount_kobo integer, p_currency text,
  p_paid_at timestamptz, p_event_key text default null, p_event_type text default 'verify'
)
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare v_payment public.aitools_payments%rowtype; v_balance integer; v_lot uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  select * into v_payment from public.aitools_payments where reference = p_reference for update;
  if not found then raise exception 'Payment not found' using errcode = 'P0002'; end if;
  if v_payment.status = 'success' then
    if v_payment.provider_transaction_id <> p_provider_transaction_id then raise exception 'Payment reference conflict' using errcode = '23505'; end if;
    select balance into v_balance from public.aitools_credit_accounts where user_id = v_payment.user_id;
    return coalesce(v_balance, 0);
  end if;
  if v_payment.status <> 'pending' or p_amount_kobo <> v_payment.amount_kobo or p_currency <> v_payment.currency
      or p_provider_transaction_id is null or p_provider_transaction_id = '' then
    raise exception 'Payment verification mismatch' using errcode = '22023';
  end if;
  if p_event_key is not null then
    insert into public.aitools_webhook_events(event_key, event_type, payment_reference)
    values (p_event_key, p_event_type, p_reference) on conflict (event_key) do nothing;
    if not found then
      select balance into v_balance from public.aitools_credit_accounts where user_id = v_payment.user_id;
      return coalesce(v_balance, 0);
    end if;
  end if;
  update public.aitools_payments set status = 'success', provider_transaction_id = p_provider_transaction_id, paid_at = p_paid_at, updated_at = now()
    where id = v_payment.id;
  insert into public.aitools_credit_accounts(user_id, balance) values (v_payment.user_id, v_payment.credits)
    on conflict (user_id) do update set balance = public.aitools_credit_accounts.balance + excluded.balance, updated_at = now()
    returning balance into v_balance;
  insert into public.aitools_credit_lots(user_id, payment_id, credits_remaining) values (v_payment.user_id, v_payment.id, v_payment.credits) returning id into v_lot;
  insert into public.aitools_credit_ledger(user_id, payment_id, credit_lot_id, entry_type, amount, balance_after, idempotency_key)
    values (v_payment.user_id, v_payment.id, v_lot, 'purchase', v_payment.credits, v_balance, 'payment:' || v_payment.reference);
  return v_balance;
end; $$;

create or replace function public.aitools_reverse_payment(
  p_reference text, p_refunded_amount integer, p_currency text, p_event_key text, p_event_type text
)
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare v_payment public.aitools_payments%rowtype; v_balance integer; v_remove integer; v_lot uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  select * into v_payment from public.aitools_payments where reference = p_reference for update;
  if not found then raise exception 'Payment not found' using errcode = 'P0002'; end if;
  if p_currency <> v_payment.currency or p_refunded_amount < v_payment.amount_kobo then
    raise exception 'Only a verified full refund reverses a credit pack' using errcode = '22023';
  end if;
  insert into public.aitools_webhook_events(event_key, event_type, payment_reference)
    values (p_event_key, p_event_type, p_reference) on conflict (event_key) do nothing;
  if not found then
    select balance into v_balance from public.aitools_credit_accounts where user_id = v_payment.user_id;
    return coalesce(v_balance, 0);
  end if;
  if v_payment.status = 'reversed' then
    select balance into v_balance from public.aitools_credit_accounts where user_id = v_payment.user_id;
    return coalesce(v_balance, 0);
  end if;
  if v_payment.status <> 'success' then
    update public.aitools_payments set status = 'reversed', updated_at = now() where id = v_payment.id;
    select balance into v_balance from public.aitools_credit_accounts where user_id = v_payment.user_id;
    return coalesce(v_balance, 0);
  end if;
  select id, credits_remaining into v_lot, v_remove from public.aitools_credit_lots where payment_id = v_payment.id for update;
  if v_lot is null then
    update public.aitools_payments set status = 'reversed', updated_at = now() where id = v_payment.id;
    select balance into v_balance from public.aitools_credit_accounts where user_id = v_payment.user_id;
    return coalesce(v_balance, 0);
  end if;
  update public.aitools_credit_lots set credits_remaining = 0 where id = v_lot;
  update public.aitools_credit_accounts set balance = balance - v_remove, updated_at = now()
    where user_id = v_payment.user_id returning balance into v_balance;
  if v_remove > 0 then
    insert into public.aitools_credit_ledger(user_id, payment_id, credit_lot_id, entry_type, amount, balance_after, idempotency_key)
      values (v_payment.user_id, v_payment.id, v_lot, 'refund', -v_remove, v_balance, 'reversal:' || v_payment.reference);
  end if;
  update public.aitools_payments set status = 'reversed', updated_at = now() where id = v_payment.id;
  return v_balance;
end; $$;

revoke all on function public.aitools_prepare_payment(text, text) from public, anon;
revoke all on function public.aitools_get_my_payment(text) from public, anon;
revoke all on function public.aitools_spend_credit(uuid) from public, anon;
revoke all on function public.aitools_refund_credit(uuid, uuid) from public, anon, authenticated;
revoke all on function public.aitools_record_usage(uuid, uuid, text, integer, integer, text) from public, anon, authenticated;
revoke all on function public.aitools_complete_payment(text, text, integer, text, timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.aitools_reverse_payment(text, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.aitools_prepare_payment(text, text) to authenticated;
grant execute on function public.aitools_get_my_payment(text) to authenticated;
grant execute on function public.aitools_spend_credit(uuid) to authenticated;
grant execute on function public.aitools_complete_payment(text, text, integer, text, timestamptz, text, text) to service_role;
grant execute on function public.aitools_reverse_payment(text, integer, text, text, text) to service_role;
grant execute on function public.aitools_refund_credit(uuid, uuid) to service_role;
grant execute on function public.aitools_record_usage(uuid, uuid, text, integer, integer, text) to service_role;

grant select on public.aitools_plans to anon, authenticated;
grant select on public.aitools_credit_accounts, public.aitools_payments, public.aitools_credit_ledger, public.aitools_tool_usage to authenticated;
grant all on public.aitools_plans, public.aitools_credit_accounts, public.aitools_payments, public.aitools_credit_lots, public.aitools_credit_ledger, public.aitools_tool_usage, public.aitools_webhook_events to service_role;
