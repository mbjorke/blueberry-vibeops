import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GitHubInstallation {
  id: number;
  account: {
    login: string;
    avatar_url: string;
    type: string;
  };
  app_id: number;
  target_type: string;
  permissions: Record<string, string>;
  events: string[];
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface UseGitHubAppReturn {
  installations: GitHubInstallation[];
  repositories: GitHubRepository[];
  loading: boolean;
  error: string | null;
  fetchInstallations: () => Promise<void>;
  fetchRepositories: (installationId: number) => Promise<void>;
}

export function useGitHubApp(): UseGitHubAppReturn {
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstallations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-app-auth?action=list-installations`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch installations: ${response.status}`);
      }

      const result = await response.json();
      console.log('Fetched installations:', result);
      setInstallations(result.installations || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch installations';
      setError(message);
      console.error('Error fetching installations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRepositories = useCallback(async (installationId: number) => {
    setLoading(true);
    setError(null);
    setRepositories([]);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-app-auth?action=list-repos&installation_id=${installationId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.status}`);
      }

      const result = await response.json();
      setRepositories(result.repositories || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch repositories';
      setError(message);
      console.error('Error fetching repositories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    installations,
    repositories,
    loading,
    error,
    fetchInstallations,
    fetchRepositories,
  };
}
