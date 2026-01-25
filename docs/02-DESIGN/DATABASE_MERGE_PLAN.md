# Unified Database Schema Design

## Overview

This document outlines the strategy for merging UXDB and VibeOps schemas into a unified "Developer Productivity" platform database.

## Design Principles

1. **Single Source of Truth**: One Supabase project, one database
2. **Unified Auth**: Supabase Auth for all users (migrate from Clerk)
3. **Multi-Tenant First**: Organizations are the primary tenant model
4. **Public + Private**: Clear separation between public discovery and private ops
5. **Extensibility**: Schema supports future Lopify concepts (time tracking, achievements)

## Unified Schema Structure

### Auth & User Management

```sql
-- Unified auth system (Supabase Auth)
auth.users (Supabase managed)

-- Unified profiles
profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  logo_url TEXT,
  display_name TEXT,
  -- UXDB additions
  clerk_user_id TEXT, -- For migration tracking
  -- VibeOps additions
  onboarding_completed BOOLEAN,
  onboarding_step INTEGER,
  welcome_email_sent BOOLEAN
)

-- Unified roles
user_roles (
  user_id UUID REFERENCES auth.users(id),
  role app_role, -- 'admin', 'client', 'superadmin'
  UNIQUE(user_id, role)
)
```

### Organizations (Multi-Tenant)

```sql
-- Organizations (from VibeOps clients table)
clients (
  id UUID PRIMARY KEY,
  name TEXT,
  billing_email TEXT,
  industry TEXT,
  logo_initial TEXT,
  logo_color TEXT,
  monthly_rate INTEGER,
  created_by UUID REFERENCES auth.users(id),
  -- UXDB additions
  is_public BOOLEAN DEFAULT false, -- Allow public org profiles?
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Org membership
client_users (
  client_id UUID REFERENCES clients(id),
  user_id UUID REFERENCES auth.users(id),
  is_org_admin BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'viewer',
  created_at TIMESTAMPTZ,
  UNIQUE(client_id, user_id)
)
```

### Public Discovery (UXDB)

```sql
-- Tool categories
tool_categories (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Tools database
tools (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES tool_categories(id),
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  pricing_model TEXT, -- subscription, usage, one-time, freemium
  free_plan JSONB,
  starter_plan JSONB,
  pro_plan JSONB,
  enterprise_plan JSONB,
  company_size_recommendations JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Tool reviews
tool_reviews (
  id UUID PRIMARY KEY,
  tool_id UUID REFERENCES tools(id), -- CHANGE: Use tool_id instead of tool_name
  user_id UUID REFERENCES auth.users(id), -- CHANGE: UUID instead of TEXT
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Review votes
review_votes (
  review_id UUID REFERENCES tool_reviews(id),
  user_id UUID REFERENCES auth.users(id), -- CHANGE: UUID instead of TEXT
  vote_type TEXT CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ,
  UNIQUE(review_id, user_id)
)

-- User tool lists
custom_lists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

user_tool_lists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tool_id UUID REFERENCES tools(id),
  custom_list_id UUID REFERENCES custom_lists(id),
  status TEXT CHECK (status IN ('used', 'favorite', 'want-to-try', 'currently-using')),
  added_at TIMESTAMPTZ,
  UNIQUE(user_id, tool_id, custom_list_id)
)
```

### Private Ops (VibeOps)

```sql
-- Repositories
repositories (
  id UUID PRIMARY KEY,
  name TEXT,
  full_name TEXT,
  github_url TEXT,
  organization_id UUID REFERENCES clients(id),
  status TEXT,
  security_score INTEGER,
  last_deploy TIMESTAMPTZ,
  language TEXT,
  stars_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Repo-org linking
client_repos (
  client_id UUID REFERENCES clients(id),
  repo_id UUID REFERENCES repositories(id),
  environment TEXT,
  created_at TIMESTAMPTZ,
  UNIQUE(client_id, repo_id)
)

-- Security findings
security_findings (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title TEXT,
  description TEXT,
  severity TEXT,
  status TEXT,
  category TEXT,
  file_path TEXT,
  line_number INTEGER,
  recommendation TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Deployments
deployments (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  environment TEXT,
  version TEXT,
  status TEXT,
  commit_hash TEXT,
  commit_message TEXT,
  deployed_by UUID REFERENCES auth.users(id),
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ
)

-- GDPR compliance
gdpr_checklist_items (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  category TEXT,
  title TEXT,
  description TEXT,
  is_completed BOOLEAN,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  priority TEXT,
  created_at TIMESTAMPTZ
)

-- Activity events
activity_events (
  id UUID PRIMARY KEY,
  project_id TEXT, -- References projects.id as text
  type TEXT,
  title TEXT,
  description TEXT,
  severity TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)

-- Projects (legacy, may merge with repositories)
projects (
  id UUID PRIMARY KEY,
  github_repo_id BIGINT,
  name TEXT,
  full_name TEXT,
  description TEXT,
  industry TEXT,
  status TEXT,
  environments JSONB,
  security_score INTEGER,
  gdpr_compliant BOOLEAN,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Cross-Platform Integration (NEW)

```sql
-- Tool usage tracking (link tools to repos)
tool_usage_tracking (
  id UUID PRIMARY KEY,
  repo_id UUID REFERENCES repositories(id),
  tool_id UUID REFERENCES tools(id),
  usage_type TEXT CHECK (usage_type IN ('primary', 'secondary', 'considered', 'replaced')),
  verified_at TIMESTAMPTZ, -- When was this verified?
  added_at TIMESTAMPTZ,
  UNIQUE(repo_id, tool_id)
)

-- Public findings (anonymized ops insights)
public_findings (
  id UUID PRIMARY KEY,
  finding_type TEXT, -- 'dependabot_stats', 'security_trend', 'tool_effectiveness', etc.
  tool_stack JSONB, -- Array of tool IDs used
  anonymized_metrics JSONB, -- Aggregated metrics
  insights TEXT, -- Human-readable insights
  opt_in_org_id UUID REFERENCES clients(id), -- Which org opted in (optional)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Tool recommendations (AI-generated from ops data)
tool_recommendations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tool_id UUID REFERENCES tools(id),
  recommendation_type TEXT, -- 'security', 'performance', 'cost', 'compatibility'
  confidence_score NUMERIC(3,2),
  reasoning TEXT,
  based_on_repo_id UUID REFERENCES repositories(id), -- Which repo triggered this?
  created_at TIMESTAMPTZ
)
```

### Legacy/Transitional Tables

```sql
-- Coupons (UXDB marketplace feature - may keep or remove)
coupons (
  id UUID PRIMARY KEY,
  tool_name TEXT, -- Consider linking to tools.id
  coupon_code TEXT,
  discount_percentage INTEGER,
  validation_status TEXT,
  success_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Bundle orders (UXDB bundle feature)
bundle_orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  stripe_session_id TEXT,
  bundle_name TEXT,
  amount INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ
)

-- Client projects (UXDB onboarding - may merge with clients)
client_projects (
  id UUID PRIMARY KEY,
  bundle_order_id UUID REFERENCES bundle_orders(id),
  user_id UUID REFERENCES auth.users(id),
  project_name TEXT,
  domain_name TEXT,
  business_email TEXT,
  -- Setup flags
  clerk_setup_completed BOOLEAN,
  stripe_setup_completed BOOLEAN,
  flyio_setup_completed BOOLEAN,
  project_delivered BOOLEAN,
  created_at TIMESTAMPTZ
)

-- Waitlist
waitlist (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  status TEXT,
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
```

## Migration Strategy

### Phase 1: Auth Migration (Clerk → Supabase Auth)

**Steps**:
1. Export all Clerk users with metadata
2. Create Supabase Auth users (bulk import or API)
3. Create mapping table: `clerk_user_migration` (clerk_id → supabase_uuid)
4. Update all foreign keys:
   - `tool_reviews.user_id` (TEXT → UUID)
   - `review_votes.user_id` (TEXT → UUID)
   - `custom_lists.user_id` (UUID already, verify)
   - `user_tool_lists.user_id` (UUID already, verify)
5. Migrate active sessions (if possible)
6. Update frontend to use Supabase Auth

**Challenges**:
- Password migration (users need to reset)
- Session migration (users need to re-login)
- Email verification status

### Phase 2: Schema Unification

**Steps**:
1. Add missing columns to existing tables
2. Create new cross-platform tables (`tool_usage_tracking`, `public_findings`)
3. Fix data inconsistencies:
   - `tool_reviews.tool_name` → `tool_id` (UUID)
   - Standardize all `user_id` to UUID
4. Merge `client_projects` data into `clients` (if applicable)
5. Update RLS policies for unified access

### Phase 3: Data Migration

**Steps**:
1. Migrate UXDB tool data to unified `tools` table
2. Migrate reviews (with tool_name → tool_id mapping)
3. Create organizations from UXDB `client_projects` (if needed)
4. Link existing repos to organizations
5. Populate `tool_usage_tracking` from ops data (if available)

### Phase 4: RLS Policy Updates

**Steps**:
1. Update UXDB tables to support org-scoped access
2. Ensure public discovery tables remain public
3. Add opt-in sharing policies for `public_findings`
4. Test multi-tenant isolation

## Key Design Decisions

### 1. Tool Reviews: tool_name vs tool_id

**Current**: UXDB uses `tool_name` (TEXT)
**Proposed**: Migrate to `tool_id` (UUID) for referential integrity

**Migration**:
```sql
-- Create mapping
CREATE TABLE tool_name_mapping AS
SELECT DISTINCT tool_name, id as tool_id
FROM tools;

-- Update reviews
UPDATE tool_reviews tr
SET tool_id = tnm.tool_id
FROM tool_name_mapping tnm
WHERE tr.tool_name = tnm.tool_name;

-- Add tool_id column, migrate, then drop tool_name
```

### 2. Organizations: client_projects vs clients

**Decision**: Keep both for now
- `clients`: Permanent multi-tenant organizations (VibeOps)
- `client_projects`: Temporary onboarding data (UXDB bundle feature)

**Future**: May merge if bundle feature is deprecated

### 3. Public vs Private Data

**Strategy**:
- **Public by default**: `tools`, `tool_categories`, `tool_reviews` (if public)
- **Private by default**: `repositories`, `security_findings`, `deployments`
- **Opt-in sharing**: `public_findings` table for anonymized insights

### 4. Tool-Repo Linking

**New Table**: `tool_usage_tracking`
- Links tools to repositories
- Enables: "Projects using Supabase have 30% fewer security issues"
- Can be populated from:
  - Package.json analysis
  - User self-reporting
  - GitHub dependency detection

## RLS Policy Strategy

### Public Discovery Tables
```sql
-- Tools: Public read, admin write
CREATE POLICY "Public can view active tools" ON tools
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tools" ON tools
  FOR ALL USING (has_role(auth.uid(), 'admin') OR is_superadmin(auth.uid()));

-- Reviews: Public read, authenticated write
CREATE POLICY "Public can view reviews" ON tool_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews" ON tool_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Private Ops Tables
```sql
-- Repositories: Org-scoped
CREATE POLICY "Org members can view org repos" ON repositories
  FOR SELECT USING (
    is_superadmin(auth.uid()) OR
    organization_id IN (SELECT unnest(user_organization_ids(auth.uid())))
  );

CREATE POLICY "Org admins can manage org repos" ON repositories
  FOR ALL USING (
    is_superadmin(auth.uid()) OR
    (organization_id IN (SELECT unnest(user_organization_ids(auth.uid()))) 
     AND is_org_admin(auth.uid(), organization_id))
  );
```

### Cross-Platform Tables
```sql
-- Tool usage tracking: Org-scoped
CREATE POLICY "Org members can view org tool usage" ON tool_usage_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = tool_usage_tracking.repo_id
      AND (is_superadmin(auth.uid()) OR 
           r.organization_id IN (SELECT unnest(user_organization_ids(auth.uid()))))
    )
  );

-- Public findings: Public read, org-scoped write
CREATE POLICY "Public can view findings" ON public_findings
  FOR SELECT USING (true);

CREATE POLICY "Org admins can create findings" ON public_findings
  FOR INSERT WITH CHECK (
    opt_in_org_id IS NULL OR
    is_org_admin(auth.uid(), opt_in_org_id)
  );
```

## Migration Checklist

- [ ] Export Clerk users
- [ ] Create Supabase Auth users
- [ ] Create user_id mapping table
- [ ] Update all foreign keys (TEXT → UUID)
- [ ] Migrate tool_reviews.tool_name → tool_id
- [ ] Create tool_usage_tracking table
- [ ] Create public_findings table
- [ ] Update RLS policies
- [ ] Test multi-tenant isolation
- [ ] Test public discovery access
- [ ] Migrate frontend auth code
- [ ] Update API endpoints
- [ ] Data validation and cleanup

## Future Extensions

### Lopify Concepts Integration

```sql
-- Time tracking (future)
time_tracking_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  repo_id UUID REFERENCES repositories(id), -- Link to work
  tool_id UUID REFERENCES tools(id), -- Tool being used
  session_type TEXT, -- 'technical', 'content'
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ
)

-- Achievements (future)
achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_type TEXT,
  points INTEGER,
  related_repo_id UUID REFERENCES repositories(id),
  related_tool_id UUID REFERENCES tools(id),
  earned_at TIMESTAMPTZ
)

-- Best work showcase (future)
best_work (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  repo_id UUID REFERENCES repositories(id),
  tool_ids UUID[], -- Array of tools used
  description TEXT,
  metrics JSONB, -- Performance, security scores, etc.
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)
```

This unified schema supports the full vision: tools discovery → ops management → productivity tracking → achievement showcase.
