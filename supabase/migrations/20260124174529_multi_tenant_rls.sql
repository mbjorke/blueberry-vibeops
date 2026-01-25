-- Multi-Tenant RLS Policy Updates
-- Phase 2: Update all policies from global admin to org-scoped

-- Helper: check superadmin by text comparison (works before enum is committed)
CREATE OR REPLACE FUNCTION check_superadmin(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id 
    AND role::text = 'superadmin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Superadmins can view all profiles
CREATE POLICY "Superadmins can view all profiles" ON profiles
  FOR SELECT USING (check_superadmin((SELECT auth.uid())));

-- Org admins can view profiles of org members
CREATE POLICY "Org admins can view org member profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_users cu1
      JOIN client_users cu2 ON cu1.client_id = cu2.client_id
      WHERE cu1.user_id = (SELECT auth.uid()) 
      AND cu1.is_org_admin = true
      AND cu2.user_id = profiles.user_id
    )
  );

-- ============================================================================
-- USER_ROLES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Superadmins can manage all roles
CREATE POLICY "Superadmins can manage all roles" ON user_roles
  FOR ALL USING (check_superadmin((SELECT auth.uid())));

-- Org admins can view roles of their org members (read only, cannot change global role)
CREATE POLICY "Org admins can view org member roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_users cu1
      JOIN client_users cu2 ON cu1.client_id = cu2.client_id
      WHERE cu1.user_id = (SELECT auth.uid()) 
      AND cu1.is_org_admin = true
      AND cu2.user_id = user_roles.user_id
    )
  );

-- ============================================================================
-- CLIENT_PROJECTS TABLE (legacy)
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all project assignments" ON client_projects;

-- Superadmins can manage all project assignments
CREATE POLICY "Superadmins can manage all project assignments" ON client_projects
  FOR ALL USING (check_superadmin((SELECT auth.uid())));

-- ============================================================================
-- CLIENTS TABLE (Organizations)
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all clients" ON clients;

-- Superadmins can manage all organizations
CREATE POLICY "Superadmins can manage all clients" ON clients
  FOR ALL 
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- Org admins can manage their own organization
CREATE POLICY "Org admins can manage own organization" ON clients
  FOR ALL
  USING (is_org_admin((SELECT auth.uid()), id))
  WITH CHECK (is_org_admin((SELECT auth.uid()), id));

-- Org members can view their organization
CREATE POLICY "Org members can view own organization" ON clients
  FOR SELECT
  USING (is_org_member((SELECT auth.uid()), id));

-- ============================================================================
-- REPOSITORIES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all repositories" ON repositories;

-- Superadmins can manage all repositories
CREATE POLICY "Superadmins can manage all repositories" ON repositories
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- Org admins can manage repos in their organization
CREATE POLICY "Org admins can manage org repositories" ON repositories
  FOR ALL
  USING (
    check_superadmin((SELECT auth.uid())) OR
    organization_id IN (SELECT unnest(user_organization_ids((SELECT auth.uid())))) AND
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE user_id = (SELECT auth.uid()) 
      AND client_id = repositories.organization_id 
      AND is_org_admin = true
    )
  )
  WITH CHECK (
    check_superadmin((SELECT auth.uid())) OR
    organization_id IN (SELECT unnest(user_organization_ids((SELECT auth.uid())))) AND
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE user_id = (SELECT auth.uid()) 
      AND client_id = repositories.organization_id 
      AND is_org_admin = true
    )
  );

-- Org members can view repos in their organization (via client_repos)
CREATE POLICY "Org members can view org repositories" ON repositories
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

-- ============================================================================
-- CLIENT_REPOS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage client repo assignments" ON client_repos;

-- Superadmins can manage all client repo assignments
CREATE POLICY "Superadmins can manage client repo assignments" ON client_repos
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- Org admins can manage repo assignments for their org
CREATE POLICY "Org admins can manage own org repo assignments" ON client_repos
  FOR ALL
  USING (is_org_admin((SELECT auth.uid()), client_id))
  WITH CHECK (is_org_admin((SELECT auth.uid()), client_id));

-- Org members can view repo assignments for their org
CREATE POLICY "Org members can view own org repo assignments" ON client_repos
  FOR SELECT
  USING (is_org_member((SELECT auth.uid()), client_id));

-- ============================================================================
-- CLIENT_USERS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage client users" ON client_users;

-- Superadmins can manage all client users
CREATE POLICY "Superadmins can manage client users" ON client_users
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- Org admins can manage users in their org
CREATE POLICY "Org admins can manage own org users" ON client_users
  FOR ALL
  USING (is_org_admin((SELECT auth.uid()), client_id))
  WITH CHECK (is_org_admin((SELECT auth.uid()), client_id));

-- Users can view their own memberships (keep existing policy if exists)
-- CREATE POLICY "Users can view own client memberships" ON client_users
--   FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- SECURITY_FINDINGS TABLE
-- Note: This table uses project_id referencing projects table
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all security findings" ON security_findings;

-- Superadmins can manage all security findings
CREATE POLICY "Superadmins can manage all security findings" ON security_findings
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- Admins can manage security findings (legacy behavior)
CREATE POLICY "Admins can manage security findings" ON security_findings
  FOR ALL
  USING (has_role((SELECT auth.uid()), 'admin'::app_role))
  WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Users can view security findings for their assigned projects
CREATE POLICY "Users can view assigned project security findings" ON security_findings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_projects cp
      WHERE cp.project_id::text = security_findings.project_id::text
      AND cp.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- DEPLOYMENTS TABLE
-- Note: This table uses project_id referencing projects table
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all deployments" ON deployments;

-- Superadmins can manage all deployments
CREATE POLICY "Superadmins can manage all deployments" ON deployments
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- Admins can manage deployments (legacy behavior)
CREATE POLICY "Admins can manage deployments" ON deployments
  FOR ALL
  USING (has_role((SELECT auth.uid()), 'admin'::app_role))
  WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Users can view deployments for their assigned projects
CREATE POLICY "Users can view assigned project deployments" ON deployments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_projects cp
      WHERE cp.project_id::text = deployments.project_id::text
      AND cp.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- GDPR_CHECKLIST_ITEMS TABLE
-- Note: This table uses project_id referencing projects table
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all GDPR items" ON gdpr_checklist_items;

-- Superadmins can manage all GDPR items
CREATE POLICY "Superadmins can manage all GDPR items" ON gdpr_checklist_items
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- Admins can manage GDPR items (legacy behavior)
CREATE POLICY "Admins can manage GDPR items" ON gdpr_checklist_items
  FOR ALL
  USING (has_role((SELECT auth.uid()), 'admin'::app_role))
  WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Users can view GDPR items for their assigned projects
CREATE POLICY "Users can view assigned project GDPR items" ON gdpr_checklist_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_projects cp
      WHERE cp.project_id::text = gdpr_checklist_items.project_id::text
      AND cp.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;

-- Superadmins can manage all projects
CREATE POLICY "Superadmins can manage all projects" ON projects
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- ============================================================================
-- ACTIVITY_EVENTS TABLE
-- Note: This table uses project_id as text
-- ============================================================================
DROP POLICY IF EXISTS "Admins can insert activity events" ON activity_events;

-- Superadmins can insert activity events
CREATE POLICY "Superadmins can insert activity events" ON activity_events
  FOR INSERT
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- Admins can insert activity events (legacy behavior)
CREATE POLICY "Admins can insert activity events" ON activity_events
  FOR INSERT
  WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- ============================================================================
-- INVITATIONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;

-- Superadmins can manage all invitations
CREATE POLICY "Superadmins can manage all invitations" ON invitations
  FOR ALL
  USING (check_superadmin((SELECT auth.uid())))
  WITH CHECK (check_superadmin((SELECT auth.uid())));

-- Org admins can manage invitations for their org
CREATE POLICY "Org admins can manage org invitations" ON invitations
  FOR ALL
  USING (is_org_admin((SELECT auth.uid()), organization_id))
  WITH CHECK (is_org_admin((SELECT auth.uid()), organization_id));

-- Keep: Anyone can view invitation by token (for accepting)
-- This policy should already exist
