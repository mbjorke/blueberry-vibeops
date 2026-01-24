-- Add onboarding tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN onboarding_step INTEGER NOT NULL DEFAULT 0,
ADD COLUMN welcome_email_sent BOOLEAN NOT NULL DEFAULT false;