# AGENTS.md

## Cursor Cloud specific instructions

### Services overview

| Service | Command | Port | Notes |
|---|---|---|---|
| Vite dev server | `npm run dev` | 8080 | React frontend |
| Local Supabase | `npx supabase start` | 54321 (API), 54322 (DB), 54323 (Studio), 54324 (Mailpit) | Requires Docker |

### Startup sequence

1. Ensure Docker daemon is running (`sudo dockerd` if not already started; socket needs `chmod 666 /var/run/docker.sock`).
2. Start Supabase: `npx supabase start` (pulls images on first run, ~1-2 min; subsequent starts are fast).
3. Confirm `.env.local` exists with `VITE_SUPABASE_URL=http://127.0.0.1:54321` and `VITE_SUPABASE_PUBLISHABLE_KEY=<anon key from supabase status>`. Note: the Supabase client code uses `VITE_SUPABASE_PUBLISHABLE_KEY` (not `VITE_SUPABASE_ANON_KEY`).
4. Start dev server: `npm run dev` (port 8080).

### Non-obvious gotchas

- The Supabase client in `src/integrations/supabase/client.ts` reads `VITE_SUPABASE_PUBLISHABLE_KEY`, **not** `VITE_SUPABASE_ANON_KEY`. The `.env.example` and `CLAUDE.md` mention `VITE_SUPABASE_ANON_KEY` but the actual code uses `VITE_SUPABASE_PUBLISHABLE_KEY`. Use the latter in `.env.local`.
- The first user to sign up after a fresh `supabase db reset` is automatically assigned `superadmin` role via the `handle_new_user()` database trigger.
- `npm run lint` exits non-zero due to pre-existing `no-explicit-any` errors across tests and some source files. This is expected.
- `npm test` has a few pre-existing test failures (9/182) related to mock setup issues in `ProjectCard.test.tsx` and `useProfile.test.tsx`. These are not environment issues.
- Docker in this cloud VM requires `fuse-overlayfs` storage driver and `iptables-legacy` (configured in `/etc/docker/daemon.json` and via `update-alternatives`).
- Standard dev commands are documented in `CLAUDE.md` and `package.json` scripts.
