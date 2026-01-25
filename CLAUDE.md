# VibeOps Hub

A SaaS security, compliance, and operations dashboard for managing client projects.

## Bash Commands

- `npm run dev`: Start development server (Vite)
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript type checking
- `npm test`: Run Vitest tests

## Database Commands (Local Supabase)

- `npm run db:start`: Start local Supabase (requires Docker)
- `npm run db:stop`: Stop local Supabase
- `npm run db:reset`: Reset database and apply all migrations fresh
- `npm run db:migrate`: Push migrations to database
- `npm run seed:test-users`: Create test users in database (for integration tests)
- `npm run seed:test-users:reset`: Reset and recreate test users

## Remote Supabase Commands

- `supabase db push`: Push migrations to remote database
- `supabase functions deploy`: Deploy all edge functions
- `supabase gen types typescript`: Regenerate TypeScript types

## Project Structure

```
src/
├── components/
│   ├── admin/           # Admin panel (user management)
│   ├── auth/            # Auth components (ProtectedRoute, PasswordStrength)
│   ├── clients/         # Client management dialogs
│   ├── dashboard/       # Dashboard components
│   ├── github/          # GitHub integration (import, connection)
│   ├── layout/          # AppLayout, AppSidebar
│   ├── onboarding/      # Client onboarding wizard
│   ├── ops-guide/       # Migration helper, pricing calculator
│   ├── project-detail/  # Project views (security, GDPR, deployments)
│   └── ui/              # Shadcn/ui primitives
├── pages/
│   ├── Index.tsx        # Main dashboard
│   ├── Clients.tsx      # Client management
│   ├── Repositories.tsx # Repository management  
│   ├── OpsGuide.tsx     # Migration helper & integration roadmap
│   └── ...
├── hooks/               # Custom hooks (useAuth, useGitHubApp, etc.)
├── integrations/        # Supabase client & types
├── data/                # Static data (integrationRoadmap)
└── types/               # TypeScript types

supabase/
├── migrations/          # Database migrations
└── functions/           # Edge functions (Deno)
```

## Database Schema

### Core Tables
- `profiles` - User profiles with preferences
- `user_roles` - Admin/client roles (app_role enum)
- `clients` - Business entities (billing)
- `repositories` - GitHub repos with status/security info
- `client_repos` - Junction: repos assigned to clients
- `client_users` - Junction: users assigned to clients

### Feature Tables
- `security_findings` - Per-project security issues
- `deployments` - Deployment history
- `gdpr_checklist_items` - Compliance tracking
- `invitations` - Client invitations
- `activity_events` - Real-time activity feed

## Business Model: Multi-Tenant Self-Service SaaS

VibeOps is a multi-tenant SaaS where each organization manages their own projects independently.

### Tenant Model

```
Platform (VibeOps - owned by superadmin)
    └── Organization A (signed up independently)
    │       ├── Org Admin (CEO who signed up, owns billing)
    │       ├── Org Admins (developers invited by CEO)
    │       ├── Client Users (external viewers with limited access)
    │       └── Repositories (imported by org admins)
    │
    └── Organization B (another tenant)
            └── ... (isolated from Org A)
```

### Role Hierarchy

| Role | Scope | Description | Capabilities |
|------|-------|-------------|--------------|
| `superadmin` | Platform | Marcus + trusted person | Manage all orgs, platform settings, see all data |
| `admin` | Organization | CEO/developers | Manage their org's repos, invite users, configure branding |
| `client` | Organization | External viewers | View assigned projects within their org only |

### User Signup & Onboarding Flow

1. **New organization signup**:
   - Person signs up → Creates new organization (tenant)
   - They become `admin` of that organization
   - They own the billing/payment relationship
   - Can configure org branding (logo, display_name in sidebar)

2. **Admin invites team members**:
   - Invite as `admin` → Developer with full org access
   - Invite as `client` → External client with view-only access to assigned projects

3. **Superadmin (platform owner)**:
   - Only Marcus + designated trusted person
   - Can view/manage all organizations
   - Access to platform-wide analytics and settings
   - Managed manually (not through normal signup)

### Database Architecture

**Current tables (need multi-tenant isolation):**
- `clients` → Should be renamed to `organizations` (the tenant)
- `client_users` → Users belonging to an organization
- `client_repos` → Repos belonging to an organization
- `user_roles` → Global role (admin/client) - needs org context

**RLS Policy Issue:**
Current policies say "Admins can manage ALL clients" - this is agency model.
Need to change to: "Admins can manage clients WHERE they are a member"

### Current Implementation (Partially Complete)

- Supabase Auth with email/password
- Two roles: `admin` and `client` (no superadmin yet)
- New users default to `client` role
- RLS policies assume single-tenant (agency model)

### Multi-Tenant Implementation (Completed)

- [x] Added `superadmin` role to `app_role` enum
- [x] Added `is_org_admin` column to `client_users` table
- [x] Added `organization_id` to `repositories` and `invitations` tables
- [x] Updated RLS policies for tenant isolation
- [x] First user signup becomes `superadmin` (platform owner)
- [x] New org signup creates `client` (org) + makes user `admin` with `is_org_admin=true`
- [x] Invitation flow scoped to organization
- [x] Helper functions: `is_superadmin()`, `is_org_admin()`, `is_org_member()`, `user_organization_ids()`

### Important Notes

- To promote a user to superadmin manually:
  ```sql
  UPDATE user_roles SET role = 'superadmin' WHERE user_id = 'USER_UUID';
  ```
- First user after db reset will become superadmin via `handle_new_user()` trigger
- `clients` table serves as organizations/tenants

## GitHub Integration

- GitHub App for repository access
- Edge function: `github-app-auth` (JWT auth, list repos)
- Edge function: `github-create-issue` (create issues from findings)
- Edge function: `github-app-webhook` (handles installation events)
- Requires: `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY` secrets
- Optional: `GITHUB_WEBHOOK_SECRET` for webhook signature verification

### GitHub App Webhook URL

**⚠️ Important Limitation**: GitHub Apps only support **one webhook URL** per app. You cannot configure different webhook URLs for different environments in a single GitHub App.

**Environment-Specific Setup Options:**

1. **Separate GitHub Apps** (Recommended for production):
   - Create different GitHub Apps for each environment (dev, staging, prod)
   - Each app can have its own webhook URL pointing to the appropriate Supabase project

2. **Single App with Environment Detection**:
   - Use one GitHub App with webhook URL pointing to your primary environment
   - For local development, use tunneling (ngrok, smee.io, etc.) to forward webhooks

3. **Current Setup**:
   - **Lovable Cloud (Testing)**: `https://uhzcblzvebrxzpwlxptb.supabase.co/functions/v1/github-app-webhook`
   - **Local Development**: `http://127.0.0.1:54321/functions/v1/github-app-webhook` (requires tunneling)
   - **Production**: TBD (update webhook URL when production environment is ready)

**Webhook Events Handled:**
- `installation` events (created, deleted, suspend, unsuspend)
- `installation_repositories` events (repositories added/removed)

**For Local Development with Tunneling:**
```bash
# Using ngrok (example)
ngrok http 54321
# Then use the ngrok URL in GitHub App webhook settings
```

## Environment Variables

### Local Development (.env.local)
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<from supabase start>

# Optional: Source database for migration detection
VITE_SOURCE_SUPABASE_URL=https://xxx.supabase.co
VITE_SOURCE_SUPABASE_ANON_KEY=<source_anon_key>
```

### Production
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon_key>
```

### Edge Function Secrets
- `RESEND_API_KEY` - Email sending
- `GITHUB_APP_ID` - GitHub App ID
- `GITHUB_APP_PRIVATE_KEY` - GitHub App private key
- `GITHUB_WEBHOOK_SECRET` - (Optional) Webhook secret for signature verification

## Code Style

- Use ES modules (import/export), not CommonJS
- Use TypeScript strict mode
- Prefer named exports over default exports
- Use Shadcn/ui components from `@/components/ui/`
- Use AppLayout for consistent page structure
- Make migrations idempotent (IF NOT EXISTS, etc.)
