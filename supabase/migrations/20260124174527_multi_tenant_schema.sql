-- Multi-Tenant Schema Changes
-- Phase 1: Add superadmin role, org admin flag, organization ownership

-- 1. Add superadmin to role enum
-- Note: This must be committed before using the new value
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'superadmin';

-- 2. Add org admin flag to client_users
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS is_org_admin BOOLEAN DEFAULT false;

-- 3. Add organization_id to repositories for direct org ownership
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- 4. Add organization_id to invitations for org-scoped invites
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- 5. Create helper function to get user's organization IDs
CREATE OR REPLACE FUNCTION user_organization_ids(p_user_id UUID) 
RETURNS UUID[] AS $$
  SELECT COALESCE(ARRAY_AGG(client_id), '{}')
  FROM client_users 
  WHERE client_users.user_id = p_user_id
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 6. Create helper function to check if user is org admin for a specific org
CREATE OR REPLACE FUNCTION is_org_admin(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_users 
    WHERE user_id = p_user_id 
    AND client_id = p_org_id 
    AND is_org_admin = true
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 7. Create helper function to check if user is member of an org
CREATE OR REPLACE FUNCTION is_org_member(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_users 
    WHERE user_id = p_user_id 
    AND client_id = p_org_id
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Add comments for documentation
COMMENT ON COLUMN client_users.is_org_admin IS 'Whether this user is an admin of this organization (can manage members, repos, settings)';
COMMENT ON COLUMN repositories.organization_id IS 'The organization that owns this repository';
COMMENT ON COLUMN invitations.organization_id IS 'The organization this invitation is for';
COMMENT ON FUNCTION user_organization_ids IS 'Returns array of organization IDs the user belongs to';
COMMENT ON FUNCTION is_org_admin IS 'Checks if user is an admin of a specific organization';
COMMENT ON FUNCTION is_org_member IS 'Checks if user is a member of a specific organization';
