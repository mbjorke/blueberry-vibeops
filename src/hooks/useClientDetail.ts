import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface ClientUser {
  id: string;
  user_id: string;
  client_id: string;
  role: string;
  created_at: string;
  profile?: {
    email: string;
    full_name: string | null;
  };
}

export interface ClientRepo {
  id: string;
  repo_id: string;
  client_id: string;
  environment: string | null;
  created_at: string;
  repository?: {
    id: string;
    name: string;
    full_name: string | null;
    description: string | null;
    github_url: string | null;
    status: string;
    security_score: number | null;
    last_deploy: string | null;
    language: string | null;
  };
}

export interface ClientDetail {
  id: string;
  name: string;
  billing_email: string | null;
  industry: string | null;
  logo_initial: string;
  logo_color: string;
  notes: string | null;
  monthly_rate: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useClientDetail = (clientId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch client details
  const { data: client, isLoading: clientLoading, error: clientError } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      return data as ClientDetail;
    },
    enabled: !!clientId,
  });

  // Fetch client users with profiles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["client-users", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data: clientUsers, error } = await supabase
        .from("client_users")
        .select("*")
        .eq("client_id", clientId);

      if (error) throw error;

      // Fetch profiles for each user
      const userIds = (clientUsers || []).map(cu => cu.user_id);
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, full_name")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      return (clientUsers || []).map(cu => ({
        ...cu,
        profile: profileMap.get(cu.user_id),
      })) as ClientUser[];
    },
    enabled: !!clientId,
  });

  // Fetch client repos with repository details
  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ["client-repos", clientId],
    queryFn: async () => {
      if (!clientId) return [];

      const { data: clientRepos, error } = await supabase
        .from("client_repos")
        .select("*")
        .eq("client_id", clientId);

      if (error) throw error;

      // Fetch repository details
      const repoIds = (clientRepos || []).map(cr => cr.repo_id);
      if (repoIds.length === 0) return [];

      const { data: repositories } = await supabase
        .from("repositories")
        .select("id, name, full_name, description, github_url, status, security_score, last_deploy, language")
        .in("id", repoIds);

      const repoMap = new Map((repositories || []).map(r => [r.id, r]));

      return (clientRepos || []).map(cr => ({
        ...cr,
        repository: repoMap.get(cr.repo_id),
      })) as ClientRepo[];
    },
    enabled: !!clientId,
  });

  // Set up realtime subscriptions
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel(`client-detail-${clientId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clients", filter: `id=eq.${clientId}` },
        () => queryClient.invalidateQueries({ queryKey: ["client", clientId] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_users", filter: `client_id=eq.${clientId}` },
        () => queryClient.invalidateQueries({ queryKey: ["client-users", clientId] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_repos", filter: `client_id=eq.${clientId}` },
        () => queryClient.invalidateQueries({ queryKey: ["client-repos", clientId] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, queryClient]);

  // Remove user from client
  const removeUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("client_users")
        .delete()
        .eq("client_id", clientId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-users", clientId] });
    },
  });

  // Unassign repo from client
  const unassignRepo = useMutation({
    mutationFn: async (repoId: string) => {
      const { error } = await supabase
        .from("client_repos")
        .delete()
        .eq("client_id", clientId)
        .eq("repo_id", repoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-repos", clientId] });
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
  });

  // Update user role
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("client_users")
        .update({ role })
        .eq("client_id", clientId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-users", clientId] });
    },
  });

  return {
    client,
    users: users || [],
    repos: repos || [],
    isLoading: clientLoading || usersLoading || reposLoading,
    error: clientError,
    removeUser,
    unassignRepo,
    updateUserRole,
  };
};
