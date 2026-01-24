-- Superadmin helper function
-- Separate migration because enum value must be committed before use

-- Create helper function to check superadmin status
CREATE OR REPLACE FUNCTION is_superadmin(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'superadmin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_superadmin IS 'Checks if user has superadmin role (platform owner)';
