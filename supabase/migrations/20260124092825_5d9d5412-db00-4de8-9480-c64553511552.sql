-- Create security_findings table
CREATE TABLE public.security_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fixed', 'ignored', 'in_progress')),
  category TEXT,
  file_path TEXT,
  line_number INTEGER,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deployments table
CREATE TABLE public.deployments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  environment TEXT NOT NULL CHECK (environment IN ('dev', 'staging', 'prod')),
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'in_progress', 'rolled_back')),
  commit_hash TEXT,
  commit_message TEXT,
  deployed_by UUID REFERENCES auth.users(id),
  deployed_by_name TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gdpr_checklist_items table
CREATE TABLE public.gdpr_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.security_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for security_findings
CREATE POLICY "Admins can manage all security findings"
ON public.security_findings
FOR ALL
USING (has_role((SELECT auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Clients can view security findings for assigned projects"
ON public.security_findings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_projects
    WHERE client_projects.project_id = security_findings.project_id::text
    AND client_projects.user_id = (SELECT auth.uid())
  )
);

-- RLS policies for deployments
CREATE POLICY "Admins can manage all deployments"
ON public.deployments
FOR ALL
USING (has_role((SELECT auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Clients can view deployments for assigned projects"
ON public.deployments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_projects
    WHERE client_projects.project_id = deployments.project_id::text
    AND client_projects.user_id = (SELECT auth.uid())
  )
);

-- RLS policies for gdpr_checklist_items
CREATE POLICY "Admins can manage all GDPR items"
ON public.gdpr_checklist_items
FOR ALL
USING (has_role((SELECT auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Clients can view GDPR items for assigned projects"
ON public.gdpr_checklist_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_projects
    WHERE client_projects.project_id = gdpr_checklist_items.project_id::text
    AND client_projects.user_id = (SELECT auth.uid())
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_security_findings_project ON public.security_findings(project_id);
CREATE INDEX idx_security_findings_severity ON public.security_findings(severity);
CREATE INDEX idx_deployments_project ON public.deployments(project_id);
CREATE INDEX idx_deployments_created ON public.deployments(created_at DESC);
CREATE INDEX idx_gdpr_items_project ON public.gdpr_checklist_items(project_id);

-- Add triggers for updated_at
CREATE TRIGGER update_security_findings_updated_at
BEFORE UPDATE ON public.security_findings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gdpr_items_updated_at
BEFORE UPDATE ON public.gdpr_checklist_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_findings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deployments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gdpr_checklist_items;