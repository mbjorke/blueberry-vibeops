-- Fix security issues in legacy tables from uxdb-main
-- These tables exist in the remote database and have overly permissive RLS policies

-- Fix aggregate function search_path issue
-- Note: Aggregate functions require ALTER AGGREGATE, but setting search_path
-- on aggregates is not supported in all Postgres versions. Skip for now.
-- The security linter warning is low-risk for aggregate functions.

-- Fix coupon_validations RLS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can create validations" ON public.coupon_validations;
  CREATE POLICY "Authenticated users can create validations"
  ON public.coupon_validations FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
EXCEPTION
  WHEN undefined_table THEN null;
END $$;

-- Fix custom_lists RLS policies (user_id is TEXT in legacy table)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create their own custom lists" ON public.custom_lists;
  CREATE POLICY "Users can create their own custom lists"
  ON public.custom_lists FOR INSERT
  WITH CHECK ((SELECT auth.uid())::text = user_id);
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete their own custom lists" ON public.custom_lists;
  CREATE POLICY "Users can delete their own custom lists"
  ON public.custom_lists FOR DELETE
  USING ((SELECT auth.uid())::text = user_id);
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their own custom lists" ON public.custom_lists;
  CREATE POLICY "Users can update their own custom lists"
  ON public.custom_lists FOR UPDATE
  USING ((SELECT auth.uid())::text = user_id)
  WITH CHECK ((SELECT auth.uid())::text = user_id);
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN undefined_column THEN null;
END $$;

-- Fix user_tool_lists RLS policies (user_id is TEXT in legacy table)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete their own tool lists" ON public.user_tool_lists;
  CREATE POLICY "Users can delete their own tool lists"
  ON public.user_tool_lists FOR DELETE
  USING ((SELECT auth.uid())::text = user_id);
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert their own tool lists" ON public.user_tool_lists;
  CREATE POLICY "Users can insert their own tool lists"
  ON public.user_tool_lists FOR INSERT
  WITH CHECK ((SELECT auth.uid())::text = user_id);
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their own tool lists" ON public.user_tool_lists;
  CREATE POLICY "Users can update their own tool lists"
  ON public.user_tool_lists FOR UPDATE
  USING ((SELECT auth.uid())::text = user_id)
  WITH CHECK ((SELECT auth.uid())::text = user_id);
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN undefined_column THEN null;
END $$;

-- Fix waitlist RLS (keep allowing public signups but require email)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public waitlist signup" ON public.waitlist;
  CREATE POLICY "Allow public waitlist signup"
  ON public.waitlist FOR INSERT
  WITH CHECK (email IS NOT NULL AND email != '');
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN undefined_column THEN null;
END $$;

-- Note: The view security definer issue (tool_rating_by_country) would require
-- recreating the view. Skipping for now as it may break the uxdb-main app.
-- To fix it manually: DROP VIEW and recreate without SECURITY DEFINER
