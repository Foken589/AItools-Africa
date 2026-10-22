# Supabase Auth setup and troubleshooting

## Auth schema

Signup and password sign-in are handled by Supabase Auth. Supabase owns the `auth` schema and its `auth.users` table. Do not create, reset, or edit `auth.users` manually. The app does not require a public profile table for authentication, and the billing tables in the app migrations are separate from Auth.

If an existing `auth.users` trigger writes to a `public.profiles` or other application table, that table and trigger function must agree. A broken trigger can reject new signup transactions. Inspect Auth and Postgres logs before changing or dropping any trigger.

## Project settings

1. Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` belong to the same Supabase project. Keep the service-role key out of all `NEXT_PUBLIC_` settings.
2. In Supabase Dashboard → Authentication → URL Configuration, set the Site URL to the deployed site origin and add these allowed redirects:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_DOMAIN/auth/callback`
3. To allow immediate signup, open Authentication → Sign In / Providers → Email and turn off **Confirm email**. With confirmation off, Supabase returns a session as soon as signup succeeds, so the app sends the user directly to the requested page. This also treats the submitted email as verified; make sure this is appropriate for your product. Configure SMTP if you want password-reset emails to work.
4. Repeat the public environment variables and allowed redirect URLs for the exact preview/deployment domains you use.

## Diagnose failures

- For a signup failure, open Supabase Dashboard → Logs → Auth and inspect the matching request. If the Auth log reports a database error, inspect Logs → Postgres at the same time. A `Database error saving new user` often points to an `auth.users` trigger, constraint, or database permission issue.
- For a sign-in failure, verify the account exists and use password reset if necessary. If the app reports that no session was created after signup, **Confirm email** is still enabled in the Supabase Email provider settings.
- If the account works in Supabase but not in the app, verify the app URL and publishable key are from that same project and restart the Next.js server after changing `.env.local`.
- Share the exact error code/message and the matching log details with secrets and personal data removed. Never share passwords, confirmation links, access tokens, service-role keys, or database credentials.

See Supabase's [redirect URL guide](https://supabase.com/docs/guides/auth/redirect-urls) and [new user database error troubleshooting](https://supabase.com/docs/guides/troubleshooting/database-error-saving-new-user-RU_EwB).
