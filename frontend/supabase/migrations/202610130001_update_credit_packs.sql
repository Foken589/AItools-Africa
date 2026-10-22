-- Update existing installations to the public trial and pack amounts.
-- Review the live schema and apply through the normal staging-first workflow.
alter table public.aitools_plans
  drop constraint if exists aitools_plans_plan_key_check;

alter table public.aitools_plans
  add constraint aitools_plans_plan_key_check check (plan_key in ('starter', 'pro', 'max'));

insert into public.aitools_plans (plan_key, name, amount_kobo, currency, credits, enabled)
values
  ('starter', 'Starter', 100000, 'NGN', 100, true),
  ('pro', 'Pro', 350000, 'NGN', 400, true),
  ('max', 'Max', 800000, 'NGN', 1000, true)
on conflict (plan_key) do update
set name = excluded.name,
    amount_kobo = excluded.amount_kobo,
    currency = excluded.currency,
    credits = excluded.credits,
    enabled = true;
