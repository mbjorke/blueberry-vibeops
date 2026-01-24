-- Create clients table (the business entity you bill)
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  billing_email TEXT,
  industry TEXT DEFAULT 'Software',
  logo_initial TEXT NOT NULL,
  logo_color TEXT NOT NULL DEFAULT 'bg-primary',
  notes TEXT,
  monthly_rate INTEGER DEFAULT 149,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create repositories table (GitHub repos, independent of clients)
CREATE TABLE public.repositories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT,
  description TEXT,
  github_repo_id BIGINT UNIQUE,
  github_url TEXT,
  default_branch TEXT DEFAULT 'main',
  language TEXT,
  private BOOLEAN DEFAULT false,
  stars_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'healthy',
  security_score INTEGER DEFAULT 85,
  last_deploy TEXT DEFAULT 'Never',
  issues TEXT[] DEFAULT '{}',
  environments JSONB NOT NULL DEFAULT '{"dev": "ok", "staging": "ok", "prod": "ok"}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Junction: which repos belong to which clients
CREATE TABLE public.client_repos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  repo_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  environment TEXT DEFAULT 'production',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, repo_id)
);

-- Junction: which users can access which clients (replaces client_projects)
CREATE TABLE public.client_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;

-- CLIENTS RLS
CREATE POLICY "Admins can manage all clients"
  ON public.clients FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view clients they belong to"
  ON public.clients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.client_users
    WHERE client_users.client_id = clients.id
    AND client_users.user_id = auth.uid()
  ));

-- REPOSITORIES RLS
CREATE POLICY "Admins can manage all repositories"
  ON public.repositories FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view repos for their clients"
  ON public.repositories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.client_repos cr
    JOIN public.client_users cu ON cu.client_id = cr.client_id
    WHERE cr.repo_id = repositories.id
    AND cu.user_id = auth.uid()
  ));

-- CLIENT_REPOS RLS
CREATE POLICY "Admins can manage client repo assignments"
  ON public.client_repos FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their client repo assignments"
  ON public.client_repos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.client_users
    WHERE client_users.client_id = client_repos.client_id
    AND client_users.user_id = auth.uid()
  ));

-- CLIENT_USERS RLS
CREATE POLICY "Admins can manage client users"
  ON public.client_users FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own client memberships"
  ON public.client_users FOR SELECT
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at
  BEFORE UPDATE ON public.repositories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.repositories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_repos;

-- Migrate existing projects data to repositories
INSERT INTO public.repositories (
  id, name, full_name, description, github_repo_id, github_url, 
  default_branch, language, private, stars_count, status, 
  security_score, last_deploy, issues, environments, created_by, created_at
)
SELECT 
  id, name, full_name, description, github_repo_id, github_url,
  default_branch, language, private, stars_count, status,
  security_score, last_deploy, issues, environments, created_by, created_at
FROM public.projects;

-- Create index for performance
CREATE INDEX idx_client_repos_client_id ON public.client_repos(client_id);
CREATE INDEX idx_client_repos_repo_id ON public.client_repos(repo_id);
CREATE INDEX idx_client_users_client_id ON public.client_users(client_id);
CREATE INDEX idx_client_users_user_id ON public.client_users(user_id);
CREATE INDEX idx_repositories_github_repo_id ON public.repositories(github_repo_id);