-- Multi-Tenant Data Migration
-- Phase 4: Migrate existing data to multi-tenant model

-- Note: This migration assumes the schema changes from previous migrations are applied
-- The superadmin role promotion will be done via a manual SQL command after signup
-- because new enum values can't be used in the same transaction they're created

-- 1. Ensure all existing client_users have is_org_admin set (default false)
DO $$
DECLARE
  first_client_id UUID;
  owner_user_id UUID := '26516391-f8a8-43ab-bdee-e97a9a4d4d69';
BEGIN
  -- Get the first client (org) if any exist
  SELECT id INTO first_client_id FROM clients ORDER BY created_at LIMIT 1;
  
  -- Ensure owner is member of the first org (if exists)
  IF first_client_id IS NOT NULL THEN
    INSERT INTO client_users (client_id, user_id, is_org_admin, role)
    VALUES (first_client_id, owner_user_id, true, 'admin')
    ON CONFLICT (client_id, user_id) 
    DO UPDATE SET is_org_admin = true, role = 'admin';
    
    RAISE NOTICE 'Added owner % to organization % as org admin', owner_user_id, first_client_id;
  END IF;
END $$;

-- 2. Update existing repositories to have organization_id from their client_repos assignments
-- This associates repos with the first client they're assigned to
UPDATE repositories r
SET organization_id = (
  SELECT cr.client_id 
  FROM client_repos cr 
  WHERE cr.repo_id = r.id 
  ORDER BY cr.created_at 
  LIMIT 1
)
WHERE r.organization_id IS NULL;

-- 3. Ensure all existing client_users have is_org_admin set (default false)
UPDATE client_users 
SET is_org_admin = false 
WHERE is_org_admin IS NULL;

-- 4. Set created_by for any clients that don't have it
-- Use the first admin user found in the system
UPDATE clients c
SET created_by = (
  SELECT ur.user_id 
  FROM user_roles ur 
  WHERE ur.role IN ('admin', 'superadmin') 
  ORDER BY ur.created_at 
  LIMIT 1
)
WHERE c.created_by IS NULL;

-- 5. Update existing invitations to have organization_id from their assigned_projects
-- If an invitation has assigned_projects, use the first one as the org
UPDATE invitations i
SET organization_id = (i.assigned_projects[1])::uuid
WHERE i.organization_id IS NULL 
AND array_length(i.assigned_projects, 1) > 0;
