-- Add notification preferences to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS security_alerts boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS deployment_updates boolean NOT NULL DEFAULT true;