# AItools Africa

AItools Africa is an early-stage Next.js application for practical AI tools. It includes Supabase email/password authentication, a Gemini-backed writing assistant, daily free usage controls, and one-time Paystack credit packs. Generation and checkout require external credentials and the Supabase billing migration described below.

## Current state

- The existing dark emerald design is preserved.
- Direct signup/sign-in, logout, password recovery, session persistence, dashboard auth checks, and account-aware navigation are implemented. Hosted Supabase must have **Confirm email** disabled for signup to create an immediate session.
- The writing assistant supports improve, summarize, email drafting, and study explanations. It calls the Gemini API from a server route, with validation, timeouts, no retries, server-only credentials, shared Redis limits, usage history, and failure refunds.
- Free: 5 writing requests per UTC day. Starter: ₦1,000 for 100 one-time credits; Pro: ₦3,500 for 400; Max: ₦8,000 for 1,000. Prices are draft MVP values, not market-validated. One credit buys one completed writing request; paid credits are spent before the free daily limit.
- Paystack checkout initialization, server-side transaction verification, raw-body HMAC-SHA512 webhook validation, idempotent credit delivery, and private payment history are implemented. They have not been live-tested.
- There was no database schema or migration in the repository. The new migration is namespaced `aitools_*`, but the live Supabase schema was not accessible and must be reviewed for conflicts before applying it.
- `.env.local` is ignored by Git. Do not print, commit, or share it.

## Requirements and local setup

- Windows 10/11, Node.js 20.9+, npm
- Supabase project
- For AI: Gemini API key and Upstash Redis REST database
- For checkout: Paystack account and test key

From PowerShell:

```powershell
cd C:\Users\MANYUBS\Documents\Projects\AItools-Africa\frontend
npm ci
Copy-Item .env.example .env.local
```

Set variables in `.env.local` (see below), then run `npm run dev`. Visit <http://localhost:3000>. Scripts: `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npm run start`. No automated test runner is configured.

## Environment variables

Public values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable key only; never the service-role key)
- `NEXT_PUBLIC_SITE_URL` (`http://localhost:3000` locally; exact HTTPS site origin in production)
- `NEXT_PUBLIC_SUPPORT_EMAIL` (optional)

Server-only secrets/configuration:

- `SUPABASE_SERVICE_ROLE_KEY` — trusted billing finalization and usage-history writes; never expose to the browser.
- `GEMINI_API_KEY` — Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey); server-only.
- `GEMINI_MODEL` — optional; defaults to `gemini-2.5-flash`. Check Google's [current free-tier model availability and limits](https://ai.google.dev/gemini-api/docs/pricing).
- `AI_FREE_DAILY_LIMIT` — optional integer from 1 to 100; defaults to 5 successful free requests per account per UTC day.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — shared rate and free-daily usage counters.
- `PAYSTACK_SECRET_KEY` — begin with a `sk_test_...` key; use `sk_live_...` only in production after tests.

Never put a secret in a `NEXT_PUBLIC_` variable. `.env.example` contains safe placeholders only.

### Get a free Gemini API key

1. Sign in to [Google AI Studio](https://aistudio.google.com/apikey) with your Google account and choose **Create API key**.
2. Edit `frontend/.env.local` (create it from `.env.example` if needed) and add or replace these entries:

   ```dotenv
   GEMINI_API_KEY=paste-your-key-here
   GEMINI_MODEL=gemini-2.5-flash
   ```

   Keep the other Supabase, Upstash, and server settings already in that file.
3. Keep the key server-only: do not use a `NEXT_PUBLIC_` prefix, commit it, or paste it into browser code or chat. `.env.local` is Git-ignored.
4. Restart the Next.js development server after changing environment variables, sign in to the app, and try the writing assistant.

The app's free daily request limit is separate from Google's free API quota. Google applies model-specific rate/usage limits and may change its free-tier availability or data terms; check its [pricing and free-tier page](https://ai.google.dev/gemini-api/docs/pricing) and [terms](https://ai.google.dev/gemini-api/terms). Do not submit sensitive information.

## Supabase auth setup

1. Set the project URL and publishable key locally and in Vercel.
2. Set the Supabase Authentication Site URL and allow the callback URLs listed in `frontend/supabase/AUTH_SETUP.md`.
3. To allow immediate signup without email confirmation, turn off **Confirm email** in the Supabase Email provider settings. This treats new email addresses as verified and lets signup return a session; password recovery still requires working email delivery.
4. Test signup directly into `/dashboard`, login, refresh persistence, logout, and password recovery with a controlled test user.

Next.js 16 uses the root `proxy.ts`; server identity checks use `supabase.auth.getUser()`. Proxy token refresh does not replace route-level authorization.

For the Auth schema model, redirect settings, or signup error diagnosis, see `frontend/supabase/AUTH_SETUP.md`. Supabase Auth owns `auth.users`; do not create or reset that table as an app migration.

## Billing schema and migration

Migrations: `frontend/supabase/migrations/202610120001_paid_plans.sql` creates the billing schema; `frontend/supabase/migrations/202610130001_update_credit_packs.sql` updates plan pricing and credits on installations where the first migration was already applied.

It creates `aitools_plans`, `aitools_credit_accounts`, `aitools_payments`, `aitools_credit_ledger`, `aitools_tool_usage`, and `aitools_webhook_events`. RLS allows users to read only their own account, payments, ledger, and usage. Client roles have no write access to balances, transaction state, plans, usage history, or webhooks. Server functions use authoritative plan amounts and grant credits atomically after verification.

**Review the live schema before applying this migration.** It was not accessible during implementation, and the original project description mentioned possible profile/credit/transaction tables. Export the live `public` schema without user data, compare for equivalent tables/functions/policies, and check that `aitools_*` will not duplicate an existing balance/ledger. Back up and apply to staging first, review RLS/grants/functions, then apply to production only if clean. If equivalent billing tables already exist, adapt this migration and the app to reuse them. Never reset production or weaken RLS.

## AI usage and Paystack behavior

The writing assistant caps prompts at 8,000 characters and provider output at 1,500 tokens, times out requests, makes no automatic retries, and records completed tasks. Upstash is required for shared per-user request limits across app instances. Failed provider requests release free daily reservations or refund a reserved paid credit. A crash during a request can leave a reservation until the next day (free allowance) or until support reconciles the account (paid credit); this should be tested and monitored before broad launch.

Paystack prices and credits come from the database plan table, not the browser. Checkout uses an authenticated, server-generated reference. The return route verifies via Paystack's server API; the webhook validates the signature over the raw body and also verifies the transaction server-to-server. The SQL function confirms reference ownership, amount, currency, pending status, and idempotency before granting credits. Pending/failed/mismatched/duplicate transactions do not add credits. A verified full `refund.processed` event reverses unspent pack credits; partial refunds and disputes still need support review and an operator response. Paystack recommends promptly handling disputes, so assign a person to monitor them before live sales.

## Manual steps to enable it

1. **Share the schema safely:** export schema only (no auth rows, secrets, or `.env.local`) and compare it with the migration. A useful command after linking the Supabase CLI is `npx supabase db dump --schema public --file frontend/supabase/current-schema.sql`. Do not send database passwords or service-role keys in chat.
2. Create a staging Supabase project or use a non-production branch. Apply the reviewed migration there using Supabase SQL Editor or your migration workflow. Verify all functions, RLS policies, grants, and plan rows.
3. Create an Upstash Redis REST database and copy its REST URL/token into the server environment.
4. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey). Set `GEMINI_API_KEY` and, optionally, `GEMINI_MODEL` as server-only environment variables.
5. Set `SUPABASE_SERVICE_ROLE_KEY` only as a server environment secret (local ignored `.env.local` and Vercel). It must never be exposed to a client component.
6. In Paystack, create/configure your integration and use its **test secret key** in `PAYSTACK_SECRET_KEY`. Configure the test webhook URL as `https://YOUR_PREVIEW_DOMAIN/api/billing/webhook`.
7. Set `NEXT_PUBLIC_SITE_URL` to the staging origin. Test a confirmed user buying both packs with Paystack test methods. Check that amount/currency match, callbacks work, webhook signature is accepted, duplicate callback+webhook adds credits once, a failed payment adds none, and dashboard history is private.
8. Only after staging review, set production Supabase/Upstash/Gemini secrets and Paystack live key/webhook in Vercel, attach your production domain, update Supabase auth URLs and site URL, deploy, and run final checks. Do not make development test charges with live keys.

## Deploy to Vercel

1. Import `Foken589/AItools-Africa`; set **Root Directory** to `frontend`.
2. Use the Next.js preset, `npm ci` install, and `npm run build` build command.
3. Set public values and server-only secrets separately for Preview and Production. Use test Paystack credentials on Preview.
4. Apply the reviewed Supabase migration to staging before testing checkout. Configure its Paystack webhook with the public preview deployment URL.
5. Verify auth, AI limits, generation failures/refunds, checkout, duplicate event idempotency, usage history, and mobile layout.
6. Set the production domain in `NEXT_PUBLIC_SITE_URL`, Supabase auth URLs, and Paystack live webhook settings; then redeploy.

To roll back app code, promote the last known-good deployment from Vercel Deployments. Database rollback requires its own reviewed plan; an app rollback does not undo SQL.

## Launch checklist

- [ ] Compare the migration with the live schema; apply/test on staging; review RLS and grants.
- [ ] Disable **Confirm email** in the Supabase Email provider and test direct signup, login, and password recovery.
- [ ] Configure Gemini, Upstash, and service-role secrets server-side; test failure refunds and limits.
- [ ] Sandbox-test Paystack initialization, verification, wrong amount/currency, failed/pending payment, duplicate webhooks, and credit history.
- [ ] Review draft prices; they have not been validated with customers.
- [ ] Configure support email and have the preliminary Privacy/Terms pages reviewed before commercial use.
- [ ] Run lint, typecheck, production build, and controlled staging auth/payment tests.
- [ ] Set up support handling for disputes and partial refunds; full refund credit reversal is automated, but dispute decisions are not.

## Troubleshooting

- **AI unavailable:** check the Gemini key/model and Google AI Studio quota, Upstash URL/token, service-role secret, and applied migration. No provider secret should appear in client bundles.
- **Checkout unavailable:** check Paystack test key, `NEXT_PUBLIC_SITE_URL`, migration, Supabase service-role key, and server logs.
- **Credits/history unavailable:** inspect migration outcome and RLS/grants. Do not disable RLS as a fix.
- **Webhook delivery failed:** inspect Paystack test event log, key mode (test/live), raw-signature route, RPC permissions, and deployment logs; resend after repair.
- **Auth redirects fail:** add the exact current preview/production callback URLs to Supabase Auth URL Configuration.

Never share passwords, tokens, complete cookies, provider secrets, or `.env.local` when troubleshooting.
