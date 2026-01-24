-- Multi-Tenant Signup Flow
-- Phase 3: Update handle_new_user() for multi-tenant signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  new_org_id UUID;
  inv_record RECORD;
  company_name TEXT;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Check if this is the first user in the system (make superadmin)
  SELECT COUNT(*) INTO user_count FROM auth.users WHERE id != NEW.id;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'superadmin');
    RAISE NOTICE 'First user % created as superadmin', NEW.email;
    RETURN NEW;
  END IF;

  -- Check for pending invitation
  SELECT * INTO inv_record 
  FROM public.invitations 
  WHERE email = NEW.email 
  AND accepted_at IS NULL 
  AND expires_at > NOW();
  
  IF inv_record IS NOT NULL THEN
    -- Invited user: assign client role
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
    
    -- If invitation has organization_id, add user to that org
    IF inv_record.organization_id IS NOT NULL THEN
      INSERT INTO public.client_users (client_id, user_id, is_org_admin, role)
      VALUES (inv_record.organization_id, NEW.id, false, 'viewer');
    END IF;
    
    RAISE NOTICE 'Invited user % created with client role', NEW.email;
    RETURN NEW;
  END IF;

  -- New organization signup: create org and make user admin
  company_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'company_name', ''),
    'My Organization'
  );
  
  INSERT INTO public.clients (name, logo_initial, logo_color, created_by)
  VALUES (
    company_name,
    UPPER(LEFT(company_name, 1)),
    'bg-primary',
    NEW.id
  )
  RETURNING id INTO new_org_id;
  
  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  
  -- Add user as org admin
  INSERT INTO public.client_users (client_id, user_id, is_org_admin, role)
  VALUES (new_org_id, NEW.id, true, 'admin');
  
  RAISE NOTICE 'New org signup: % created organization % as admin', NEW.email, company_name;
  
  RETURN NEW;
END;
$$;

-- Ensure trigger exists (it should already, but just in case)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
