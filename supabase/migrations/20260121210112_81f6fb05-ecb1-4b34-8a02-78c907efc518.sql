-- Create projects table to store imported projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  github_repo_id BIGINT UNIQUE,
  name TEXT NOT NULL,
  full_name TEXT, -- owner/repo format
  description TEXT,
  industry TEXT DEFAULT 'Software',
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical')),
  environments JSONB NOT NULL DEFAULT '{"dev": "ok", "staging": "ok", "prod": "ok"}',
  security_score INTEGER DEFAULT 85,
  gdpr_compliant BOOLEAN DEFAULT false,
  gdpr_warning BOOLEAN DEFAULT false,
  last_deploy TEXT DEFAULT 'Never',
  issues TEXT[] DEFAULT '{}',
  logo_initial TEXT NOT NULL,
  logo_color TEXT NOT NULL DEFAULT 'bg-primary',
  github_url TEXT,
  default_branch TEXT DEFAULT 'main',
  private BOOLEAN DEFAULT false,
  language TEXT,
  stars_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all projects"
ON public.projects
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Clients can view projects assigned to them
CREATE POLICY "Clients can view assigned projects"
ON public.projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_projects cp
    WHERE cp.project_id = projects.id::text
    AND cp.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for projects
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;