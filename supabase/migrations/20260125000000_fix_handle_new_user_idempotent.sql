-- Fix handle_new_user() to be idempotent
-- This prevents issues if the function is called multiple times (e.g., during password reset)
-- The function now checks if profile/role already exist before inserting

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
  profile_exists BOOLEAN;
  role_exists BOOLEAN;
  org_membership_exists BOOLEAN;
  profile_insert_error TEXT;
  role_insert_error TEXT;
BEGIN
  -- Log function entry for debugging
  RAISE NOTICE '[handle_new_user] Processing user: % (ID: %)', NEW.email, NEW.id;
  
  -- Check if profile already exists (idempotency check)
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = NEW.id) INTO profile_exists;
  
  -- Only create profile if it doesn't exist
  IF NOT profile_exists THEN
    BEGIN
      INSERT INTO public.profiles (user_id, email, full_name)
      VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
      );
      RAISE NOTICE '[handle_new_user] Created profile for user: %', NEW.email;
    EXCEPTION
      WHEN unique_violation THEN
        -- Profile was created by another process, that's okay
        RAISE NOTICE '[handle_new_user] Profile already exists for user: % (race condition handled)', NEW.email;
      WHEN OTHERS THEN
        profile_insert_error := SQLERRM;
        RAISE WARNING '[handle_new_user] Error creating profile for user %: %', NEW.email, profile_insert_error;
        -- Continue execution - profile might exist from previous attempt
    END;
  ELSE
    RAISE NOTICE '[handle_new_user] Profile already exists for user: %, skipping creation', NEW.email;
  END IF;

  -- Check if user already has a role (idempotency check)
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) INTO role_exists;
  
  -- If user already has a role, don't modify it (preserve existing permissions)
  -- This prevents the function from overwriting existing roles during password reset or other operations
  IF role_exists THEN
    RAISE NOTICE '[handle_new_user] User % already has a role assigned, skipping role assignment to preserve permissions', NEW.email;
    -- Log the existing role for debugging
    DECLARE
      existing_role TEXT;
    BEGIN
      SELECT role INTO existing_role FROM public.user_roles WHERE user_id = NEW.id LIMIT 1;
      RAISE NOTICE '[handle_new_user] Preserving existing role: % for user: %', existing_role, NEW.email;
    END;
    RETURN NEW;
  END IF;
  
  -- Check if user already has organization membership (idempotency check)
  -- If they do, they're an existing user and we shouldn't create a new org
  SELECT EXISTS(SELECT 1 FROM public.client_users WHERE user_id = NEW.id) INTO org_membership_exists;
  
  IF org_membership_exists THEN
    RAISE NOTICE '[handle_new_user] User % already has organization membership, skipping org creation', NEW.email;
    -- Still need to assign a role if they don't have one (edge case)
    -- Default to 'client' if no role exists
    BEGIN
      INSERT INTO public.user_roles (user_id, role) 
      VALUES (NEW.id, 'client')
      ON CONFLICT (user_id, role) DO NOTHING;
      RAISE NOTICE '[handle_new_user] Assigned default client role to existing org member: %', NEW.email;
    EXCEPTION
      WHEN OTHERS THEN
        role_insert_error := SQLERRM;
        RAISE WARNING '[handle_new_user] Error assigning default role to user %: %', NEW.email, role_insert_error;
    END;
    RETURN NEW;
  END IF;

  -- Check if this is the first user in the system (make superadmin)
  SELECT COUNT(*) INTO user_count FROM auth.users WHERE id != NEW.id;
  IF user_count = 0 THEN
    BEGIN
      INSERT INTO public.user_roles (user_id, role) 
      VALUES (NEW.id, 'superadmin')
      ON CONFLICT (user_id, role) DO NOTHING;
      RAISE NOTICE '[handle_new_user] First user % created as superadmin', NEW.email;
    EXCEPTION
      WHEN OTHERS THEN
        role_insert_error := SQLERRM;
        RAISE WARNING '[handle_new_user] Error assigning superadmin role to first user %: %', NEW.email, role_insert_error;
    END;
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
    BEGIN
      INSERT INTO public.user_roles (user_id, role) 
      VALUES (NEW.id, 'client')
      ON CONFLICT (user_id, role) DO NOTHING;
      RAISE NOTICE '[handle_new_user] Assigned client role to invited user: %', NEW.email;
    EXCEPTION
      WHEN OTHERS THEN
        role_insert_error := SQLERRM;
        RAISE WARNING '[handle_new_user] Error assigning client role to invited user %: %', NEW.email, role_insert_error;
    END;
    
    -- If invitation has organization_id, add user to that org (only if not already a member)
    IF inv_record.organization_id IS NOT NULL THEN
      BEGIN
        INSERT INTO public.client_users (client_id, user_id, is_org_admin, role)
        VALUES (inv_record.organization_id, NEW.id, false, 'viewer')
        ON CONFLICT (client_id, user_id) DO NOTHING;
        RAISE NOTICE '[handle_new_user] Added invited user % to organization: %', NEW.email, inv_record.organization_id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING '[handle_new_user] Error adding invited user % to organization %: %', NEW.email, inv_record.organization_id, SQLERRM;
      END;
    END IF;
    
    RAISE NOTICE '[handle_new_user] Invited user % setup completed', NEW.email;
    RETURN NEW;
  END IF;

  -- New organization signup: create org and make user admin
  company_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'company_name', ''),
    'My Organization'
  );
  
  BEGIN
    INSERT INTO public.clients (name, logo_initial, logo_color, created_by)
    VALUES (
      company_name,
      UPPER(LEFT(company_name, 1)),
      'bg-primary',
      NEW.id
    )
    RETURNING id INTO new_org_id;
    RAISE NOTICE '[handle_new_user] Created organization "%" (ID: %) for user: %', company_name, new_org_id, NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING '[handle_new_user] Error creating organization for user %: %', NEW.email, SQLERRM;
      -- Continue anyway - might be able to assign role
      new_org_id := NULL;
  END;
  
  -- Assign admin role
  BEGIN
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE NOTICE '[handle_new_user] Assigned admin role to user: %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      role_insert_error := SQLERRM;
      RAISE WARNING '[handle_new_user] Error assigning admin role to user %: %', NEW.email, role_insert_error;
  END;
  
  -- Add user as org admin (only if org was created successfully)
  IF new_org_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.client_users (client_id, user_id, is_org_admin, role)
      VALUES (new_org_id, NEW.id, true, 'admin')
      ON CONFLICT (client_id, user_id) DO NOTHING;
      RAISE NOTICE '[handle_new_user] Added user % as org admin to organization: %', NEW.email, new_org_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING '[handle_new_user] Error adding user % as org admin to organization %: %', NEW.email, new_org_id, SQLERRM;
    END;
  END IF;
  
  RAISE NOTICE '[handle_new_user] New org signup completed for user: % (organization: %)', NEW.email, company_name;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the trigger (would prevent user creation)
    RAISE WARNING '[handle_new_user] Unexpected error processing user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;
