import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Repository {
  id: string;
  name: string;
  full_name: string | null;
  description: string | null;
  github_repo_id: number | null;
  github_url: string | null;
  default_branch: string | null;
  language: string | null;
  private: boolean | null;
  stars_count: number | null;
  status: string;
  security_score: number | null;
  last_deploy: string | null;
  issues: string[] | null;
  environments: Record<string, string>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  client_id?: string | null;
  client_name?: string | null;
}

export const useRepositories = (clientId?: string) => {
  const queryClient = useQueryClient();

  const { data: repositories, isLoading, error } = useQuery({
    queryKey: ["repositories", clientId],
    queryFn: async () => {
      let query = supabase.from("repositories").select("*");
      
      if (clientId) {
        // Get repos for a specific client
        const { data: clientRepos } = await supabase
          .from("client_repos")
          .select("repo_id")
          .eq("client_id", clientId);
        
        const repoIds = clientRepos?.map((cr) => cr.repo_id) || [];
        if (repoIds.length === 0) return [];
        
        query = query.in("id", repoIds);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      // Get client assignments for each repo
      const reposWithClients = await Promise.all(
        (data || []).map(async (repo) => {
          const { data: clientRepo } = await supabase
            .from("client_repos")
            .select("client_id, clients(name)")
            .eq("repo_id", repo.id)
            .maybeSingle();

          return {
            ...repo,
            environments: repo.environments as Record<string, string>,
            client_id: clientRepo?.client_id || null,
            client_name: (clientRepo?.clients as { name: string } | null)?.name || null,
          };
        })
      );

      return reposWithClients as Repository[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("repositories-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "repositories" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["repositories"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_repos" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["repositories"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const assignToClient = useMutation({
    mutationFn: async ({ repoId, clientId }: { repoId: string; clientId: string }) => {
      // Remove existing assignment first
      await supabase.from("client_repos").delete().eq("repo_id", repoId);
      
      // Add new assignment
      const { error } = await supabase
        .from("client_repos")
        .insert({ repo_id: repoId, client_id: clientId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const unassignFromClient = useMutation({
    mutationFn: async (repoId: string) => {
      const { error } = await supabase
        .from("client_repos")
        .delete()
        .eq("repo_id", repoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteRepository = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("repositories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
  });

  // Split repos into assigned and unassigned
  const assignedRepos = repositories?.filter((r) => r.client_id) || [];
  const unassignedRepos = repositories?.filter((r) => !r.client_id) || [];

  return {
    repositories: repositories || [],
    assignedRepos,
    unassignedRepos,
    isLoading,
    error,
    assignToClient,
    unassignFromClient,
    deleteRepository,
  };
};
