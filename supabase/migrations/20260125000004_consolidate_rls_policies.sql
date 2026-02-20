-- Consolidate Multiple Permissive RLS Policies
-- This migration fixes performance warnings by combining multiple permissive policies
-- into single policies using OR conditions, reducing policy evaluation overhead.

-- ============================================================================
-- ACTIVITY_EVENTS TABLE
-- ============================================================================
-- Drop existing multiple INSERT policies
DROP POLICY IF EXISTS "Superadmins can insert activity events" ON activity_events;
DROP POLICY IF EXISTS "Admins can insert activity events" ON activity_events;

-- Consolidated INSERT policy: Superadmins OR Admins can insert
CREATE POLICY "Admins and superadmins can insert activity events" ON activity_events
  FOR INSERT
  WITH CHECK (
    check_superadmin((SELECT auth.uid())) OR
    has_role((SELECT auth.uid()), 'admin'::app_role)
  );

-- ============================================================================
-- CLIENT_PROJECTS TABLE
-- ============================================================================
-- Drop existing multiple SELECT policies
DROP POLICY IF EXISTS "Superadmins can manage all project assignments" ON client_projects;
DROP POLICY IF EXISTS "Users can view own project assignments" ON client_projects;

-- Consolidated SELECT policy
CREATE POLICY "Users can view own project assignments or superadmins can view all" ON client_projects
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    (SELECT auth.uid()) = user_id
  );

-- Consolidated ALL policy for superadmins (for INSERT/UPDATE/DELETE)
CREATE POLICY "Superadmins can manage all project assignments" ON client_projects
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- ============================================================================
-- CLIENT_REPOS TABLE
-- ============================================================================
-- Drop existing multiple policies
DROP POLICY IF EXISTS "Superadmins can manage client repo assignments" ON client_repos;
DROP POLICY IF EXISTS "Org admins can manage own org repo assignments" ON client_repos;
DROP POLICY IF EXISTS "Org members can view own org repo assignments" ON client_repos;
DROP POLICY IF EXISTS "Users can view their client repo assignments" ON client_repos;

-- Consolidated SELECT policy
CREATE POLICY "Users can view repo assignments" ON client_repos
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), client_id) OR
    is_org_member((SELECT auth.uid()), client_id) OR
    EXISTS (
      SELECT 1 FROM client_users
      WHERE client_users.client_id = client_repos.client_id
      AND client_users.user_id = (SELECT auth.uid())
    )
  );

-- Consolidated ALL policy for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can manage repo assignments" ON client_repos
  FOR ALL
  USING (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), client_id)
  )
  WITH CHECK (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), client_id)
  );

-- ============================================================================
-- CLIENT_USERS TABLE
-- ============================================================================
-- Drop existing multiple policies
DROP POLICY IF EXISTS "Superadmins can manage client users" ON client_users;
DROP POLICY IF EXISTS "Org admins can manage own org users" ON client_users;

-- Consolidated SELECT policy
CREATE POLICY "Users can view client memberships" ON client_users
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), client_id) OR
    (SELECT auth.uid()) = user_id
  );

-- Consolidated ALL policy for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can manage client users" ON client_users
  FOR ALL
  USING (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), client_id)
  )
  WITH CHECK (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), client_id)
  );

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
-- Drop existing multiple policies
DROP POLICY IF EXISTS "Superadmins can manage all clients" ON clients;
DROP POLICY IF EXISTS "Org admins can manage own organization" ON clients;
DROP POLICY IF EXISTS "Org members can view own organization" ON clients;
DROP POLICY IF EXISTS "Users can view clients they belong to" ON clients;

-- Consolidated SELECT policy
CREATE POLICY "Users can view organizations" ON clients
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), id) OR
    is_org_member((SELECT auth.uid()), id) OR
    EXISTS (
      SELECT 1 FROM client_users
      WHERE client_users.client_id = clients.id
      AND client_users.user_id = (SELECT auth.uid())
    )
  );

-- Consolidated ALL policy for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can manage organizations" ON clients
  FOR ALL
  USING (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), id)
  )
  WITH CHECK (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), id)
  );

-- ============================================================================
-- DEPLOYMENTS TABLE
-- ============================================================================
-- Drop existing multiple policies
DROP POLICY IF EXISTS "Superadmins can manage all deployments" ON deployments;
DROP POLICY IF EXISTS "Admins can manage deployments" ON deployments;
DROP POLICY IF EXISTS "Users can view assigned project deployments" ON deployments;
DROP POLICY IF EXISTS "Clients can view deployments for assigned projects" ON deployments;

-- Consolidated SELECT policy
CREATE POLICY "Users can view deployments" ON deployments
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    has_role((SELECT auth.uid()), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM client_projects cp
      WHERE cp.project_id::text = deployments.project_id::text
      AND cp.user_id = (SELECT auth.uid())
    )
  );

-- Consolidated ALL policy for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can manage deployments" ON deployments
  FOR ALL
  USING (
    check_superadmin((SELECT auth.uid())) OR
    has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  WITH CHECK (
    check_superadmin((SELECT auth.uid())) OR
    has_role((SELECT auth.uid()), 'admin'::app_role)
  );

-- ============================================================================
-- GDPR_CHECKLIST_ITEMS TABLE
-- ============================================================================
-- Drop existing multiple policies
DROP POLICY IF EXISTS "Superadmins can manage all GDPR items" ON gdpr_checklist_items;
DROP POLICY IF EXISTS "Admins can manage GDPR items" ON gdpr_checklist_items;
DROP POLICY IF EXISTS "Users can view assigned project GDPR items" ON gdpr_checklist_items;
DROP POLICY IF EXISTS "Clients can view GDPR items for assigned projects" ON gdpr_checklist_items;

-- Consolidated SELECT policy
CREATE POLICY "Users can view GDPR items" ON gdpr_checklist_items
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    has_role((SELECT auth.uid()), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM client_projects cp
      WHERE cp.project_id::text = gdpr_checklist_items.project_id::text
      AND cp.user_id = (SELECT auth.uid())
    )
  );

-- Consolidated ALL policy for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can manage GDPR items" ON gdpr_checklist_items
  FOR ALL
  USING (
    check_superadmin((SELECT auth.uid())) OR
    has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  WITH CHECK (
    check_superadmin((SELECT auth.uid())) OR
    has_role((SELECT auth.uid()), 'admin'::app_role)
  );

-- ============================================================================
-- INVITATIONS TABLE
-- ============================================================================
-- Drop existing multiple policies
DROP POLICY IF EXISTS "Superadmins can manage all invitations" ON invitations;
DROP POLICY IF EXISTS "Org admins can manage org invitations" ON invitations;
-- Note: "Anyone can view invitation by token" policy should remain separate
-- as it's a special case for unauthenticated access (it uses USING (true))

-- Consolidated SELECT policy (combines superadmin and org admin)
-- The token-based policy remains separate since it's for unauthenticated access
CREATE POLICY "Admins can view invitations" ON invitations
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), organization_id)
  );

-- Consolidated ALL policy for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can manage invitations" ON invitations
  FOR ALL
  USING (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), organization_id)
  )
  WITH CHECK (
    check_superadmin((SELECT auth.uid())) OR
    is_org_admin((SELECT auth.uid()), organization_id)
  );

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Drop existing multiple SELECT policies
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Org admins can view org member profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Consolidated SELECT policy (combines superadmin, org admin, and own profile)
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    (SELECT auth.uid()) = user_id OR
    EXISTS (
      SELECT 1 FROM client_users cu1
      JOIN client_users cu2 ON cu1.client_id = cu2.client_id
      WHERE cu1.user_id = (SELECT auth.uid()) 
      AND cu1.is_org_admin = true
      AND cu2.user_id = profiles.user_id
    )
  );

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
-- Drop existing multiple SELECT policies
DROP POLICY IF EXISTS "Superadmins can manage all projects" ON projects;
DROP POLICY IF EXISTS "Clients can view assigned projects" ON projects;

-- Consolidated SELECT policy
CREATE POLICY "Users can view projects" ON projects
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    EXISTS (
      SELECT 1 FROM client_projects cp
      WHERE cp.project_id = projects.id::text
      AND cp.user_id = (SELECT auth.uid())
    )
  );

-- Consolidated ALL policy for INSERT/UPDATE/DELETE
CREATE POLICY "Superadmins can manage all projects" ON projects
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- ============================================================================
-- REPOSITORIES TABLE
-- ============================================================================
-- Drop existing multiple policies
DROP POLICY IF EXISTS "Superadmins can manage all repositories" ON repositories;
DROP POLICY IF EXISTS "Org admins can manage org repositories" ON repositories;
DROP POLICY IF EXISTS "Org members can view org repositories" ON repositories;
DROP POLICY IF EXISTS "Users can view repos for their clients" ON repositories;

-- Consolidated SELECT policy
CREATE POLICY "Users can view repositories" ON repositories
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    organization_id IN (SELECT unnest(user_organization_ids((SELECT auth.uid())))) OR
    EXISTS (
      SELECT 1 FROM client_repos cr
      JOIN client_users cu ON cu.client_id = cr.client_id
      WHERE cr.repo_id = repositories.id
      AND cu.user_id = (SELECT auth.uid())
    )
  );

-- Consolidated ALL policy for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can manage repositories" ON repositories
  FOR ALL
  USING (
    check_superadmin((SELECT auth.uid())) OR
    (
      organization_id IN (SELECT unnest(user_organization_ids((SELECT auth.uid())))) AND
      EXISTS (
        SELECT 1 FROM client_users 
        WHERE user_id = (SELECT auth.uid()) 
        AND client_id = repositories.organization_id 
        AND is_org_admin = true
      )
    )
  )
  WITH CHECK (
    check_superadmin((SELECT auth.uid())) OR
    (
      organization_id IN (SELECT unnest(user_organization_ids((SELECT auth.uid())))) AND
      EXISTS (
        SELECT 1 FROM client_users 
        WHERE user_id = (SELECT auth.uid()) 
        AND client_id = repositories.organization_id 
        AND is_org_admin = true
      )
    )
  );

-- ============================================================================
-- ROLE_CHANGE_AUDIT TABLE
-- ============================================================================
-- Drop existing multiple SELECT policies
DROP POLICY IF EXISTS "Admins can view all role change history" ON role_change_audit;
DROP POLICY IF EXISTS "Users can view own role change history" ON role_change_audit;

-- Consolidated SELECT policy
CREATE POLICY "Users can view role change history" ON role_change_audit
  FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (SELECT auth.uid())
      AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================================================
-- SECURITY_FINDINGS TABLE
-- ============================================================================
-- Drop existing multiple policies
DROP POLICY IF EXISTS "Superadmins can manage all security findings" ON security_findings;
DROP POLICY IF EXISTS "Admins can manage security findings" ON security_findings;
DROP POLICY IF EXISTS "Users can view assigned project security findings" ON security_findings;
DROP POLICY IF EXISTS "Clients can view security findings for assigned projects" ON security_findings;

-- Consolidated SELECT policy
CREATE POLICY "Users can view security findings" ON security_findings
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    has_role((SELECT auth.uid()), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM client_projects cp
      WHERE cp.project_id::text = security_findings.project_id::text
      AND cp.user_id = (SELECT auth.uid())
    )
  );

-- Consolidated ALL policy for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can manage security findings" ON security_findings
  FOR ALL
  USING (
    check_superadmin((SELECT auth.uid())) OR
    has_role((SELECT auth.uid()), 'admin'::app_role)
  )
  WITH CHECK (
    check_superadmin((SELECT auth.uid())) OR
    has_role((SELECT auth.uid()), 'admin'::app_role)
  );

-- ============================================================================
-- USER_ROLES TABLE
-- ============================================================================
-- Drop existing multiple SELECT policies
DROP POLICY IF EXISTS "Superadmins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Org admins can view org member roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;

-- Consolidated SELECT policy (combines superadmin, org admin, and own roles)
CREATE POLICY "Users can view roles" ON user_roles
  FOR SELECT
  USING (
    check_superadmin((SELECT auth.uid())) OR
    (SELECT auth.uid()) = user_id OR
    EXISTS (
      SELECT 1 FROM client_users cu1
      JOIN client_users cu2 ON cu1.client_id = cu2.client_id
      WHERE cu1.user_id = (SELECT auth.uid()) 
      AND cu1.is_org_admin = true
      AND cu2.user_id = user_roles.user_id
    )
  );

-- Consolidated ALL policy for INSERT/UPDATE/DELETE (superadmins only)
CREATE POLICY "Superadmins can manage all roles" ON user_roles
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));
