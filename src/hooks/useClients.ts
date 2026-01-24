import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Client {
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
  repo_count?: number;
  user_count?: number;
}

export const useClients = () => {
  const queryClient = useQueryClient();

  const { data: clients, isLoading, error } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Get counts for each client
      const clientsWithCounts = await Promise.all(
        (data || []).map(async (client) => {
          const [repoCount, userCount] = await Promise.all([
            supabase
              .from("client_repos")
              .select("id", { count: "exact", head: true })
              .eq("client_id", client.id),
            supabase
              .from("client_users")
              .select("id", { count: "exact", head: true })
              .eq("client_id", client.id),
          ]);
          
          return {
            ...client,
            repo_count: repoCount.count || 0,
            user_count: userCount.count || 0,
          };
        })
      );
      
      return clientsWithCounts as Client[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("clients-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clients" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["clients"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createClient = useMutation({
    mutationFn: async (client: Omit<Client, "id" | "created_at" | "updated_at" | "repo_count" | "user_count">) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("clients")
        .insert({ ...client, created_by: user.user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  return {
    clients: clients || [],
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
  };
};
