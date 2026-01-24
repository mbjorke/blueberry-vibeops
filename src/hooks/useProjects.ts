import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Project, ProjectStatus, EnvironmentStatus } from '@/types/project';

interface DbRepository {
  id: string;
  name: string;
  full_name: string | null;
  description: string | null;
  industry?: string | null;
  status: string;
  environments: {
    dev: string;
    staging: string;
    prod: string;
  };
  security_score: number | null;
  last_deploy: string | null;
  issues: string[] | null;
  github_repo_id: number | null;
  github_url: string | null;
  private: boolean | null;
  language: string | null;
  stars_count: number | null;
  created_at: string;
}

function mapDbRepoToProject(dbRepo: DbRepository): Project {
  return {
    id: dbRepo.id,
    name: dbRepo.name,
    industry: dbRepo.language || 'Software', // Use language as industry fallback
    status: (dbRepo.status as ProjectStatus) || 'healthy',
    environments: {
      dev: (dbRepo.environments?.dev as EnvironmentStatus) || 'ok',
      staging: (dbRepo.environments?.staging as EnvironmentStatus) || 'ok',
      prod: (dbRepo.environments?.prod as EnvironmentStatus) || 'ok',
    },
    securityScore: dbRepo.security_score ?? 85,
    gdprCompliant: false, // Repos don't have GDPR fields
    gdprWarning: false,
    lastDeploy: dbRepo.last_deploy || 'Never',
    issues: dbRepo.issues || [],
    logoInitial: dbRepo.name.charAt(0).toUpperCase(),
    logoColor: 'bg-primary',
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch from repositories table (new schema)
      const { data, error: fetchError } = await supabase
        .from('repositories')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedProjects = (data || []).map((p) => 
        mapDbRepoToProject(p as unknown as DbRepository)
      );
      
      setProjects(mappedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Subscribe to realtime changes on repositories
  useEffect(() => {
    const channel = supabase
      .channel('repositories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'repositories',
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
  };
}
