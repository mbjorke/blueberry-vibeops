# Database Schema Analysis: UXDB vs VibeOps

## UXDB Schema Overview

### Core Tables

#### `tool_categories`
- **Purpose**: Categorize tools (Design, Development, AI, etc.)
- **Key Fields**: `id`, `name`, `description`, `icon`
- **RLS**: Public read access

#### `tools`
- **Purpose**: Main tool database with pricing and metadata
- **Key Fields**: 
  - `id`, `name`, `category_id`, `description`
  - `website_url`, `logo_url`
  - `pricing_model` (subscription, usage, one-time, freemium)
  - `free_plan`, `starter_plan`, `pro_plan`, `enterprise_plan` (JSONB)
  - `company_size_recommendations` (JSONB: solo, agency, scaleup)
  - `is_active`
- **RLS**: Public read for active tools

#### `tool_reviews`
- **Purpose**: User reviews and ratings for tools
- **Key Fields**: `id`, `tool_name`, `user_id`, `rating` (1-5), `review_text`, `is_verified`, `helpful_count`
- **Note**: Uses `tool_name` (TEXT) not `tool_id` (UUID) - potential inconsistency
- **RLS**: Public read, authenticated write

#### `review_votes`
- **Purpose**: Voting on reviews (helpful/not helpful)
- **Key Fields**: `review_id`, `user_id` (TEXT - Clerk ID), `vote_type`
- **RLS**: Public read, authenticated write

#### `custom_lists`
- **Purpose**: User-created tool collections
- **Key Fields**: `id`, `user_id`, `name`, `description`, `is_public`
- **RLS**: Users can manage own lists, public lists visible to all

#### `user_tool_lists`
- **Purpose**: Junction table linking users to tools with status
- **Key Fields**: `user_id`, `tool_id`, `custom_list_id`, `status` (used, favorite, want-to-try, currently-using)
- **RLS**: Users can manage own tool lists

#### `coupons`
- **Purpose**: Coupon codes for tools (marketplace feature)
- **Key Fields**: `tool_name`, `coupon_code`, `discount_percentage`, `validation_status`, `success_rate`
- **RLS**: Public read for active coupons

#### `coupon_validations`
- **Purpose**: Track coupon validation attempts
- **Key Fields**: `coupon_id`, `validation_method`, `is_valid`, `confidence_score`
- **RLS**: Public read/write (transparency)

#### `bundle_orders`
- **Purpose**: Track developer productivity bundle purchases
- **Key Fields**: `user_id`, `stripe_session_id`, `bundle_name`, `amount`, `status`
- **RLS**: Users can view own orders

#### `client_projects`
- **Purpose**: Onboarding information for bundle customers
- **Key Fields**: `project_name`, `domain_name`, `business_email`, `logo_url`, `user_roles` (JSONB), `payment_plans` (JSONB)
- **Setup flags**: `clerk_setup_completed`, `stripe_setup_completed`, `flyio_setup_completed`, `project_delivered`
- **RLS**: Users can manage own projects

#### `waitlist`
- **Purpose**: Email waitlist for platform
- **Key Fields**: `email`, `status` (pending, invited, registered), `source`, `metadata` (JSONB)
- **RLS**: Public insert, public read

### Auth System
- **Current**: Clerk (user_id stored as TEXT in some tables)
- **Note**: Mixed usage - some tables use UUID (auth.users), some use TEXT (Clerk IDs)

---

## VibeOps Schema Overview

### Core Tables

#### `profiles`
- **Purpose**: User profile information with branding
- **Key Fields**: 
  - `user_id` (UUID, FK to auth.users)
  - `email`, `full_name`, `company_name`
  - `logo_url`, `display_name` (for org branding)
  - `onboarding_completed`, `onboarding_step`, `welcome_email_sent`
- **RLS**: Users can view/update own, org admins can view org members, superadmins can view all

#### `user_roles`
- **Purpose**: Global role assignment
- **Key Fields**: `user_id` (UUID), `role` (app_role enum: admin, client, superadmin)
- **RLS**: Users can view own, superadmins can manage all

#### `clients` (Organizations)
- **Purpose**: Multi-tenant organizations
- **Key Fields**: 
  - `id` (UUID), `name`, `billing_email`, `industry`
  - `logo_initial`, `logo_color`, `monthly_rate`
  - `created_by` (UUID, FK to auth.users)
- **RLS**: Org-scoped (org admins manage own org, superadmins manage all)

#### `client_users`
- **Purpose**: Junction table for org membership with admin flags
- **Key Fields**: 
  - `client_id` (UUID, FK to clients)
  - `user_id` (UUID, FK to auth.users)
  - `is_org_admin` (BOOLEAN) - NEW in multi-tenant migration
  - `role` (TEXT: viewer, admin, etc.)
- **RLS**: Org-scoped

#### `repositories`
- **Purpose**: GitHub repositories with ops data
- **Key Fields**: 
  - `id` (UUID), `name`, `full_name`, `github_url`
  - `organization_id` (UUID, FK to clients) - NEW in multi-tenant migration
  - `status` (healthy, warning, critical)
  - `security_score`, `last_deploy`, `language`, `stars_count`
- **RLS**: Org-scoped (org admins manage org repos, members can view)

#### `client_repos`
- **Purpose**: Junction table linking repos to clients/orgs
- **Key Fields**: `client_id`, `repo_id`, `environment` (production, staging, dev)
- **RLS**: Org-scoped

#### `security_findings`
- **Purpose**: Security vulnerabilities and issues
- **Key Fields**: 
  - `project_id` (UUID, FK to projects)
  - `title`, `description`, `severity` (critical, high, medium, low, info)
  - `status` (open, fixed, ignored, in_progress)
  - `category`, `file_path`, `line_number`, `recommendation`
- **RLS**: Admins can manage, users can view assigned projects

#### `deployments`
- **Purpose**: Deployment history
- **Key Fields**: 
  - `project_id` (UUID, FK to projects)
  - `environment` (dev, staging, prod)
  - `version`, `status` (success, failed, in_progress, rolled_back)
  - `commit_hash`, `commit_message`, `deployed_by` (UUID), `duration_seconds`
- **RLS**: Admins can manage, users can view assigned projects

#### `gdpr_checklist_items`
- **Purpose**: GDPR compliance tracking
- **Key Fields**: 
  - `project_id` (UUID, FK to projects)
  - `category`, `title`, `description`
  - `is_completed`, `completed_at`, `completed_by` (UUID)
  - `priority` (high, medium, low)
- **RLS**: Admins can manage, users can view assigned projects

#### `invitations`
- **Purpose**: User invitations with org context
- **Key Fields**: 
  - `email`, `token` (UUID), `invited_by` (UUID)
  - `organization_id` (UUID, FK to clients) - NEW in multi-tenant migration
  - `assigned_projects` (TEXT[] - legacy, stores client IDs)
  - `expires_at`, `accepted_at`
- **RLS**: Org-scoped (org admins manage org invites, superadmins manage all)

#### `activity_events`
- **Purpose**: Real-time activity feed
- **Key Fields**: 
  - `project_id` (TEXT - references projects.id as text)
  - `type` (deployment, status_change, security_event, compliance)
  - `title`, `description`, `severity` (info, success, warning, critical)
  - `metadata` (JSONB)
- **RLS**: Admins can insert, users can view assigned projects

#### `projects`
- **Purpose**: Project metadata (may overlap with repositories)
- **Key Fields**: 
  - `id` (UUID), `github_repo_id` (BIGINT), `name`, `full_name`
  - `description`, `industry`, `status`, `environments` (JSONB)
  - `security_score`, `gdpr_compliant`, `gdpr_warning`
  - `last_deploy`, `issues` (TEXT[]), `logo_initial`, `logo_color`
  - `github_url`, `default_branch`, `private`, `language`, `stars_count`
  - `created_by` (UUID)
- **RLS**: Admins can manage all, clients can view assigned

### Helper Functions
- `has_role(user_id, role)` - Check if user has role
- `is_superadmin(user_id)` - Check superadmin status
- `is_org_admin(user_id, org_id)` - Check org admin status
- `is_org_member(user_id, org_id)` - Check org membership
- `user_organization_ids(user_id)` - Get array of org IDs user belongs to

### Auth System
- **Current**: Supabase Auth (all user_id fields are UUID)
- **Multi-tenant**: First user becomes superadmin, new signups create orgs

---

## Schema Comparison & Overlap Analysis

### Overlapping Concepts

| Concept | UXDB | VibeOps | Notes |
|---------|------|---------|-------|
| **Users** | Clerk (TEXT IDs) | Supabase Auth (UUID) | **Conflict**: Different auth systems |
| **Organizations** | `client_projects` (bundle onboarding) | `clients` (multi-tenant orgs) | Different purposes, could merge |
| **Tools vs Repos** | `tools` (discovery) | `repositories` (ops tracking) | Complementary - tools used in repos |
| **User Lists** | `custom_lists`, `user_tool_lists` | N/A | UXDB-specific feature |
| **Reviews** | `tool_reviews`, `review_votes` | N/A | UXDB-specific feature |
| **Projects** | `client_projects` (onboarding) | `projects`, `repositories` (ops) | Different purposes |

### Key Differences

1. **Auth System Mismatch**
   - UXDB: Clerk (user_id as TEXT)
   - VibeOps: Supabase Auth (user_id as UUID)
   - **Impact**: Need migration strategy

2. **Organization Model**
   - UXDB: `client_projects` for bundle onboarding (temporary)
   - VibeOps: `clients` as permanent multi-tenant organizations
   - **Impact**: UXDB doesn't have persistent org concept

3. **Tool vs Repository**
   - UXDB: `tools` = discoverable tools (Figma, Supabase, etc.)
   - VibeOps: `repositories` = GitHub repos being managed
   - **Relationship**: Repos can use tools, tools can be recommended based on repo data

4. **Data Privacy**
   - UXDB: Mostly public (tools, reviews)
   - VibeOps: Private by default (org-scoped)
   - **Impact**: Need careful merging strategy

---

## Unified Schema Proposal

### Core Principles

1. **Single Auth System**: Migrate UXDB to Supabase Auth
2. **Unified Organizations**: Use VibeOps `clients` table as the org model
3. **Complementary Data**: Tools and repos serve different purposes, both needed
4. **Public vs Private**: Clear separation of public discovery vs private ops

### Proposed Table Structure

```
Unified Developer Productivity Platform Schema

Auth & Users:
├── auth.users (Supabase)
├── profiles (unified)
└── user_roles (unified)

Organizations:
└── clients (organizations/tenants)

Public Discovery (UXDB):
├── tool_categories
├── tools
├── tool_reviews
├── review_votes
├── custom_lists
└── user_tool_lists

Private Ops (VibeOps):
├── repositories
├── client_repos
├── security_findings
├── deployments
├── gdpr_checklist_items
└── activity_events

Cross-Platform:
├── tool_usage_tracking (NEW - link tools to repos)
├── public_findings (NEW - anonymized ops insights)
└── achievements (FUTURE - from Lopify concepts)
```

### New Tables Needed

#### `tool_usage_tracking`
- **Purpose**: Link tools to repositories (which tools are used in which repos)
- **Fields**: `repo_id`, `tool_id`, `usage_type` (primary, secondary, considered), `added_at`
- **Use Case**: "Projects using Supabase have 30% fewer security issues"

#### `public_findings`
- **Purpose**: Anonymized ops data for public discovery
- **Fields**: `finding_type`, `tool_stack` (JSONB), `anonymized_metrics`, `insights`, `opt_in_org_id`
- **Use Case**: Aggregate dependabot stats, security trends, tool effectiveness

---

## Migration Challenges

### 1. Auth Migration (Clerk → Supabase Auth)
- **Complexity**: High
- **Steps**:
  1. Export Clerk users
  2. Create Supabase Auth users
  3. Map Clerk IDs to Supabase UUIDs
  4. Update all foreign keys
  5. Migrate sessions

### 2. User ID Type Mismatch
- **Issue**: UXDB uses TEXT (Clerk), VibeOps uses UUID
- **Solution**: Migrate all TEXT user_id to UUID during auth migration

### 3. Organization Model
- **Issue**: UXDB `client_projects` is temporary onboarding data
- **Solution**: Create orgs from `client_projects` or let users create orgs separately

### 4. Tool vs Repository Relationship
- **Issue**: No existing link between tools and repos
- **Solution**: Create `tool_usage_tracking` table and populate from ops data

### 5. Public vs Private Data
- **Issue**: UXDB is public, VibeOps is private
- **Solution**: Maintain RLS policies, add opt-in sharing for public findings

---

## Next Steps

1. **Create unified schema migration plan**
2. **Design auth migration strategy**
3. **Plan data anonymization for public findings**
4. **Design tool-repo linking mechanism**
5. **Create integration roadmap**
