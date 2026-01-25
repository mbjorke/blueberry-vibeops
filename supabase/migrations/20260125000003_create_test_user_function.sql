-- Helper function to create test users via SQL
-- This bypasses JWT issues with local Supabase's ES256 tokens
-- Only use this for test users in development!

-- Ensure pgcrypto extension is available in public schema
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

CREATE OR REPLACE FUNCTION public.create_test_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
DECLARE
  user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- Generate user ID
  user_id := gen_random_uuid();
  
  -- Hash password using bcrypt (Supabase's method)
  -- pgcrypto functions are in the extensions schema
  encrypted_pw := crypt(p_password, gen_salt('bf'));
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    p_email,
    encrypted_pw,
    NOW(),
    NOW(),
    NOW(),
    jsonb_build_object(
      'full_name', COALESCE(p_full_name, ''),
      'company_name', COALESCE(p_company_name, '')
    ),
    '{}'::jsonb,
    '',
    ''
  );
  
  -- The handle_new_user() trigger will fire automatically
  -- and create profile, role, and organization
  
  RETURN user_id;
END;
$$;

COMMENT ON FUNCTION public.create_test_user IS 'Creates a test user in auth.users. Only for development/testing!';

-- Helper function to delete test users
CREATE OR REPLACE FUNCTION public.delete_test_user(
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

COMMENT ON FUNCTION public.delete_test_user IS 'Deletes a test user from auth.users. Only for development/testing!';

-- Grant execute permissions to service_role (for admin operations)
-- Note: This function should only be called with service_role key
GRANT EXECUTE ON FUNCTION public.create_test_user TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_test_user TO service_role;
