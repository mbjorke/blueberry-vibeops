-- Auth Safeguards: Constraints and Audit Logging
-- This migration adds additional safeguards to prevent permission loss and track role changes

-- 1. Create audit logging table for role changes
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_role TEXT,
  new_role TEXT,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  change_source TEXT DEFAULT 'system', -- 'system', 'admin', 'trigger', 'migration'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own role change history
CREATE POLICY "Users can view own role change history"
  ON public.role_change_audit FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- RLS Policy: Admins can view all role change history
CREATE POLICY "Admins can view all role change history"
  ON public.role_change_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = (SELECT auth.uid())
      AND role IN ('admin', 'superadmin')
    )
  );

-- 2. Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change(
  p_user_id UUID,
  p_old_role TEXT,
  p_new_role TEXT,
  p_change_reason TEXT DEFAULT NULL,
  p_change_source TEXT DEFAULT 'system'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.role_change_audit (
    user_id,
    old_role,
    new_role,
    changed_by,
    change_reason,
    change_source
  )
  VALUES (
    p_user_id,
    p_old_role,
    p_new_role,
    (SELECT auth.uid()),
    p_change_reason,
    p_change_source
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail if audit logging fails
    RAISE WARNING 'Failed to log role change for user %: %', p_user_id, SQLERRM;
END;
$$;

-- 3. Create trigger function to audit role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if role actually changed
  IF (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) THEN
    PERFORM public.log_role_change(
      NEW.user_id,
      OLD.role::TEXT,
      NEW.role::TEXT,
      'Role updated via user_roles table',
      'database_trigger'
    );
  ELSIF (TG_OP = 'INSERT') THEN
    PERFORM public.log_role_change(
      NEW.user_id,
      NULL,
      NEW.role::TEXT,
      'Role assigned via user_roles table',
      'database_trigger'
    );
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.log_role_change(
      OLD.user_id,
      OLD.role::TEXT,
      NULL,
      'Role removed via user_roles table',
      'database_trigger'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. Create trigger to audit role changes
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_roles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 5. Create function to verify user state integrity
CREATE OR REPLACE FUNCTION public.verify_user_integrity(p_user_id UUID)
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_exists BOOLEAN;
  role_exists BOOLEAN;
  role_count INTEGER;
  org_membership_count INTEGER;
BEGIN
  -- Check 1: Profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = p_user_id) INTO profile_exists;
  IF NOT profile_exists THEN
    RETURN QUERY SELECT 'profile_exists'::TEXT, 'FAIL'::TEXT, 'User profile does not exist'::TEXT;
  ELSE
    RETURN QUERY SELECT 'profile_exists'::TEXT, 'PASS'::TEXT, 'User profile exists'::TEXT;
  END IF;
  
  -- Check 2: Role exists
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = p_user_id) INTO role_exists;
  SELECT COUNT(*) INTO role_count FROM public.user_roles WHERE user_id = p_user_id;
  
  IF NOT role_exists THEN
    RETURN QUERY SELECT 'role_exists'::TEXT, 'WARN'::TEXT, 'User has no role assigned'::TEXT;
  ELSIF role_count > 1 THEN
    RETURN QUERY SELECT 'role_count'::TEXT, 'WARN'::TEXT, format('User has %s roles (expected 1)', role_count)::TEXT;
  ELSE
    RETURN QUERY SELECT 'role_exists'::TEXT, 'PASS'::TEXT, 'User has exactly one role'::TEXT;
  END IF;
  
  -- Check 3: Organization membership (optional, but should exist for admin/client)
  SELECT COUNT(*) INTO org_membership_count 
  FROM public.client_users 
  WHERE user_id = p_user_id;
  
  IF org_membership_count = 0 THEN
    -- This is okay for superadmin, but warn for others
    DECLARE
      user_role TEXT;
    BEGIN
      SELECT role INTO user_role FROM public.user_roles WHERE user_id = p_user_id LIMIT 1;
      IF user_role = 'superadmin' THEN
        RETURN QUERY SELECT 'org_membership'::TEXT, 'PASS'::TEXT, 'Superadmin does not require org membership'::TEXT;
      ELSE
        RETURN QUERY SELECT 'org_membership'::TEXT, 'WARN'::TEXT, format('User with role %s has no organization membership', user_role)::TEXT;
      END IF;
    END;
  ELSE
    RETURN QUERY SELECT 'org_membership'::TEXT, 'PASS'::TEXT, format('User is member of %s organization(s)', org_membership_count)::TEXT;
  END IF;
  
  RETURN;
END;
$$;

-- 6. Create function to check for users with missing roles (data integrity check)
CREATE OR REPLACE FUNCTION public.find_users_without_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  profile_created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.email,
    p.created_at
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id
  )
  ORDER BY p.created_at DESC;
$$;

-- 7. Create function to check for users with missing profiles (data integrity check)
CREATE OR REPLACE FUNCTION public.find_users_without_profiles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    u.id AS user_id,
    u.email,
    u.created_at
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
  )
  ORDER BY u.created_at DESC;
$$;

-- 8. Add index for audit table queries
CREATE INDEX IF NOT EXISTS idx_role_change_audit_user_id ON public.role_change_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_audit_created_at ON public.role_change_audit(created_at DESC);

-- 9. Add comments for documentation
COMMENT ON TABLE public.role_change_audit IS 'Audit log of all role changes for security and debugging';
COMMENT ON FUNCTION public.log_role_change IS 'Logs a role change to the audit table';
COMMENT ON FUNCTION public.verify_user_integrity IS 'Verifies user state integrity (profile, role, org membership)';
COMMENT ON FUNCTION public.find_users_without_roles IS 'Finds users who have profiles but no roles (data integrity issue)';
COMMENT ON FUNCTION public.find_users_without_profiles IS 'Finds users who exist in auth.users but have no profile (data integrity issue)';

-- 10. Create a view for easy role change monitoring
CREATE OR REPLACE VIEW public.role_change_summary AS
SELECT 
  rca.id,
  rca.user_id,
  p.email,
  rca.old_role,
  rca.new_role,
  rca.change_source,
  rca.change_reason,
  rca.created_at,
  changed_by_user.email AS changed_by_email
FROM public.role_change_audit rca
LEFT JOIN public.profiles p ON p.user_id = rca.user_id
LEFT JOIN public.profiles changed_by_user ON changed_by_user.user_id = rca.changed_by
ORDER BY rca.created_at DESC;

-- Enable RLS on view (inherits from underlying table)
-- Note: Views don't support RLS directly, but queries will use the underlying table's RLS

COMMENT ON VIEW public.role_change_summary IS 'Summary view of role changes with user emails for easier monitoring';
